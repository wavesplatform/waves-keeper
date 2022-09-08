import * as React from 'react';
import { WithTranslation, withTranslation } from 'react-i18next';
import * as styles from './index.styl';
import { Balance, DateFormat } from '../../ui';
import { getFee } from './parseTx';
import { getMoney } from '../../../utils/converters';
import { MessageComponentProps } from '../types';

class UpdateAssetInfoInfoComponent extends React.PureComponent<
  Pick<MessageComponentProps, 'message' | 'assets'> & WithTranslation
> {
  render() {
    const { t, message, assets } = this.props;

    const { messageHash, data } = message as Extract<
      typeof message,
      { type: 'transaction' }
    >;

    const tx = { type: data?.type, ...data?.data };

    const fee = getMoney(getFee(tx), assets);
    return (
      <div>
        <div className={styles.txRow}>
          <div className="tx-title tag1 basic500">
            {t('transactions.assetId')}
          </div>
          <div className={styles.txValue} data-testid="updateAssetInfoAssetId">
            {tx.assetId}
          </div>
        </div>

        <div className={styles.txRow}>
          <div className="tx-title tag1 basic500">{t('transactions.name')}</div>
          <div
            className={styles.txValue}
            data-testid="updateAssetInfoAssetName"
          >
            {tx.name}
          </div>
        </div>

        {tx.description ? (
          <div className={styles.txRow}>
            <div className="tx-title tag1 basic500">
              {t('transactions.description')}
            </div>
            <div
              className={styles.txValue}
              data-testid="updateAssetInfoAssetDescription"
            >
              {tx.description}
            </div>
          </div>
        ) : null}

        <div className={styles.txRow}>
          <div className="tx-title tag1 basic500">{t('transactions.txid')}</div>
          <div className={styles.txValue}>{messageHash}</div>
        </div>

        <div className={styles.txRow}>
          <div className="tx-title tag1 basic500">{t('transactions.fee')}</div>
          <div className={styles.txValue}>
            <Balance
              data-testid="updateAssetInfoFee"
              isShortFormat={true}
              balance={fee}
              showAsset={true}
            />
          </div>
        </div>

        <div className={styles.txRow}>
          <div className="tx-title tag1 basic500">
            {t('transactions.txTime')}
          </div>
          <div className={styles.txValue}>
            <DateFormat date={tx.timestamp} />
          </div>
        </div>
      </div>
    );
  }
}

export const UpdateAssetInfoInfo = withTranslation()(
  UpdateAssetInfoInfoComponent
);
