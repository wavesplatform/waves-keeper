import { MsgStatus } from '../constants';
import { PreferencesAccount } from 'preferences/types';
import { TRANSACTION_TYPE } from '@waves/ts-types';
import { IWavesAuthParams } from '@waves/waves-transactions/dist/transactions';
import { IMoneyLike } from 'ui/utils/converters';

export type MessageInput = {
  account: PreferencesAccount;
  broadcast?: boolean;
  options?: {
    getMeta?: unknown;
    uid?: unknown;
  };
  origin?: string;
  successPath?: string | null;
  title?: string | null;
} & (
  | {
      type: 'auth';
      data: {
        data: string;
        host?: string;
        icon?: string;
        isRequest?: boolean;
        name?: string;
        origin?: unknown;
        referrer?: string;
        successPath?: string;
        type?: number;
      };
    }
  | {
      type: 'authOrigin';
      data: {
        data?: unknown;
        isRequest?: boolean;
        origin?: unknown;
        successPath?: string;
        type?: number;
      };
    }
  | {
      type: 'cancelOrder';
      data: {
        amountAsset?: string;
        data?: {
          senderPublicKey?: string;
          timestamp?: number;
        };
        isRequest?: boolean;
        origin?: unknown;
        priceAsset?: string;
        successPath?: string;
        type?: never;
      };
    }
  | {
      type: 'customData';
      data: {
        data?: unknown;
        isRequest?: boolean;
        origin?: unknown;
        publicKey?: unknown;
        successPath?: string;
        type?: number;
      };
    }
  | {
      type: 'order';
      data: {
        isRequest?: never;
        successPath?: string;
        type: 1002;
        data: {
          amount: IMoneyLike;
          matcherFee: IMoneyLike;
          price: IMoneyLike;
        };
      };
    }
  | {
      type: 'request';
      data: {
        data?: {
          senderPublicKey?: string;
          timestamp?: number;
        };
        isRequest?: boolean;
        origin?: unknown;
        successPath?: string;
        type?: never;
      };
    }
  | {
      type: 'transaction';
      data: {
        isRequest?: boolean;
        origin?: unknown;
        successPath?: string;
        type: typeof TRANSACTION_TYPE[keyof typeof TRANSACTION_TYPE];
        data: {
          amount: IMoneyLike;
          attachment: string;
          fee?: unknown;
          recipient: string;
        };
      };
    }
  | {
      type: 'transactionPackage';
      data: {
        data?: unknown;
        isRequest?: boolean;
        origin?: unknown;
        successPath?: string;
        type?: number;
      };
    }
  | {
      type: 'wavesAuth';
      data: IWavesAuthParams & {
        isRequest?: boolean;
        successPath?: string;
        type?: never;
      };
    }
);

export type MessageInputOfType<T extends MessageInput['type']> = Extract<
  MessageInput,
  { type: T }
>;

interface TxData {
  type: typeof TRANSACTION_TYPE[keyof typeof TRANSACTION_TYPE];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  referrer?: string | URL;
  binary?: string;
  timestamp?: number;
  publicKey?: string;
  successPath?: string;
}

export type MessageStoreItem = {
  account: PreferencesAccount;
  broadcast?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  err?: any;
  ext_uuid: unknown;
  id: string;
  json?: string;
  lease?: unknown;
  origin?: string;
  result?: string;
  status: MsgStatus;
  successPath?: string | null;
  timestamp: number;
  title?: string | null;
} & (
  | {
      type: 'transaction';
      messageHash?: string | string[];
      data: TxData;
    }
  | {
      type: 'transactionPackage';
      messageHash?: string | string[];
      data: TxData[] & { type?: unknown };
    }
  | {
      type: 'wavesAuth';
      messageHash: string;
      data: {
        publicKey: string;
        timestamp?: number;
        type?: never;
      };
    }
  | {
      type: 'auth';
      messageHash?: string | string[];
      data: {
        type: 1000;
        referrer: string | undefined;
        isRequest: boolean | undefined;
        data: {
          data: string;
          prefix: string;
          host: string;
          name: string | undefined;
          icon: string | undefined;
        };
      };
    }
  | {
      type: 'order';
      messageHash: string;
      data: {
        type: 1002;
        data: {
          chainId: number;
          matcherFee: IMoneyLike;
          matcherPublicKey: string;
          senderPublicKey: string;
          timestamp: number;
        };
      };
    }
  | {
      type: 'cancelOrder';
      amountAsset?: string;
      messageHash: string;
      priceAsset?: string;
      data: {
        type?: never;
        data: {
          senderPublicKey: string;
          timestamp: number;
        };
      };
    }
  | {
      type: 'request';
      messageHash: string;
      data: {
        type?: never;
        data: {
          senderPublicKey: string;
          timestamp: number;
        };
      };
    }
  | {
      type: 'authOrigin';
      messageHash?: string | string[];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: any;
    }
  | {
      type: 'customData';
      messageHash?: string | string[];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: any;
    }
);
