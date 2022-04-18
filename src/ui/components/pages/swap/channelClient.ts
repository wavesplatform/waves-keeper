import BigNumber from '@waves/bignumber';
import { Asset } from '@waves/data-entities';
import { base64Encode } from '@waves/ts-lib-crypto';
import Long from 'long';
import { proto } from './channel.proto.compiled';

type CallArg =
  | { type: 'integer'; value: BigNumber }
  | { type: 'binary'; value: string }
  | { type: 'string'; value: string }
  | { type: 'boolean'; value: boolean }
  | { type: 'list'; value: CallArg[] };

type ExchangeChannelResult =
  | {
      type: 'error';
      code: proto.Response.Error.CODES;
    }
  | {
      type: 'data';
      args: CallArg[];
      priceImpact: number;
      toAmountCoins: BigNumber;
      worstAmountCoins: BigNumber;
    };

interface ExchangeInput {
  fromAmountCoins: BigNumber;
  fromAsset: Asset;
  toAsset: Asset;
}

interface ExchangeRequest extends ExchangeInput {
  id: string;
}

class ExchangeChannelConnectionError {}

type Subscriber = (
  err: ExchangeChannelConnectionError | null,
  vendor?: string,
  response?: ExchangeChannelResult
) => void;

function convertArg(arg: proto.Response.Exchange.Argument): CallArg {
  if ('integerValue' in arg) {
    return {
      type: 'integer',
      value: new BigNumber(String(arg.integerValue)),
    };
  } else if ('binaryValue' in arg) {
    return {
      type: 'binary',
      value: `base64:${base64Encode(arg.binaryValue)}`,
    };
  } else if ('stringValue' in arg) {
    return {
      type: 'string',
      value: arg.stringValue,
    };
  } else if ('booleanValue' in arg) {
    return {
      type: 'boolean',
      value: arg.booleanValue,
    };
  } else if ('list' in arg) {
    return {
      type: 'list',
      value: arg.list.items.map(a => convertArg(a)),
    };
  }
}

export class ExchangeChannelClient {
  private activeRequest: ExchangeRequest | null = null;
  private closedByUser = false;
  private nextId = 1;
  private reconnectTimeout: number | null = null;
  private subscriber: Subscriber | null = null;
  private url: string;
  private ws: WebSocket | null = null;

  constructor(url: string) {
    this.url = url;
  }

  private connect() {
    if (this.ws) {
      return;
    }

    this.ws = new WebSocket(this.url);
    this.ws.binaryType = 'arraybuffer';

    this.ws.onopen = () => {
      if (this.activeRequest) {
        this.send();
      }
    };

    this.ws.onmessage = event => {
      if (!this.activeRequest || !this.subscriber) {
        return;
      }

      const res = proto.Response.decode(new Uint8Array(event.data));

      if (res.id !== this.activeRequest.id) {
        return;
      }

      if (res.exchange.data) {
        this.subscriber(null, res.exchange.vendor, {
          type: 'data',
          args: res.exchange.data.arguments.map(arg => convertArg(arg)),
          priceImpact: res.exchange.data.priceImpact,
          toAmountCoins: new BigNumber(String(res.exchange.data.amount)),
          worstAmountCoins: new BigNumber(
            String(res.exchange.data.worstAmount)
          ),
        });
      } else {
        this.subscriber(null, res.exchange.vendor, {
          type: 'error',
          code: res.exchange.error.code,
        });
      }
    };

    this.ws.onclose = () => {
      if (this.ws) {
        this.ws.onopen = null;
        this.ws.onmessage = null;
        this.ws.onclose = null;
        this.ws = null;
      }

      if (this.closedByUser) {
        return;
      }

      if (this.subscriber) {
        this.subscriber(new ExchangeChannelConnectionError());
      }

      this.reconnectTimeout = window.setTimeout(() => {
        this.connect();
      }, 5000);
    };
  }

  private send() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const { fromAmountCoins, id, fromAsset, toAsset } = this.activeRequest;

      const encoded = proto.Request.encode(
        proto.Request.create({
          exchange: proto.Request.Exchange.create({
            amount: Long.fromString(fromAmountCoins.toFixed()),
            id,
            source: fromAsset.id,
            target: toAsset.id,
          }),
        })
      ).finish();

      this.ws.send(encoded);
    } else {
      this.connect();
    }
  }

  exchange(input: ExchangeInput, subscriber: Subscriber) {
    this.activeRequest = { ...input, id: String(this.nextId++) };
    this.subscriber = subscriber;
    this.send();

    return () => {
      this.activeRequest = null;
      this.subscriber = null;
    };
  }

  close() {
    this.closedByUser = true;

    if (this.ws) {
      this.ws.close();
    }

    if (this.reconnectTimeout != null) {
      window.clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }
}
