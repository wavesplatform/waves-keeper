import { SeedWallet, SeedWalletInput } from './seed';
import { EncodedSeedWallet, EncodedSeedWalletInput } from './encodedSeed';
import { PrivateKeyWallet, PrivateKeyWalletInput } from './privateKey';
import { LedgerWallet, LedgerWalletInput, LedgerApi } from './ledger';
import { WxWallet, WxWalletInput } from './wx';

export function createWallet(
  input:
    | ({ type: 'seed' } & SeedWalletInput)
    | ({ type: 'encodedSeed' } & EncodedSeedWalletInput)
    | ({ type: 'privateKey' } & PrivateKeyWalletInput)
    | ({ type: 'wx' } & WxWalletInput)
    | ({ type: 'ledger' } & LedgerWalletInput),
  {
    ledger,
  }: {
    ledger: LedgerApi;
  }
) {
  switch (input.type) {
    case 'seed':
      return new SeedWallet({
        name: input.name,
        network: input.network,
        networkCode: input.networkCode,
        seed: input.seed,
      });
    case 'encodedSeed':
      return new EncodedSeedWallet({
        encodedSeed: input.encodedSeed,
        name: input.name,
        network: input.network,
        networkCode: input.networkCode,
      });
    case 'privateKey':
      return new PrivateKeyWallet({
        name: input.name,
        network: input.network,
        networkCode: input.networkCode,
        privateKey: input.privateKey,
      });
    case 'wx':
      return new WxWallet(
        {
          name: input.name,
          network: input.network,
          networkCode: input.networkCode,
          publicKey: input.publicKey,
          address: input.address,
          uuid: input.uuid,
          username: input.username,
        },
        this.identity
      );
    case 'ledger':
      return new LedgerWallet(
        {
          address: input.address,
          id: input.id,
          name: input.name,
          network: input.network,
          networkCode: input.networkCode,
          publicKey: input.publicKey,
        },
        ledger
      );
    default:
      throw new Error(`Unsupported wallet type: "${(input as any).type}"`);
  }
}
