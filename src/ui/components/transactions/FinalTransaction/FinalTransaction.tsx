import * as styles from './final.styl';
import * as React from 'react';
import {
  useTranslation,
  withTranslation,
  WithTranslation,
} from 'react-i18next';
import { Button } from '../../ui';
import cn from 'classnames';
import oauth from '../OriginAuth';
import { isMe as isOrder } from '../CreateOrder/parseTx';
import { TxHeader } from '../BaseTransaction';
import { TransactionStatusState } from 'ui/reducers/localState';
import { PreferencesAccount } from 'preferences/types';
import { MessageStoreItem } from 'messages/types';
import { AssetDetail } from 'assets/types';
import { MessageConfig } from '../types';
import { NotificationsStoreItem } from 'notifications/types';

const Error = ({
  approveError,
}: {
  approveError: { error: unknown } | boolean | undefined;
}) => {
  const { t } = useTranslation();

  return (
    <div className={`plate ${styles.finalTxPlate}`}>
      <div
        className={`headline2Bold margin-main-big error-icon ${styles.finalTxTitle}`}
      >
        {t('sign.someError')}
      </div>
      <div className={`body3 ${styles.finalTxPlate}`}>
        {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          JSON.stringify((approveError as any).error, null, 4)
        }
      </div>
    </div>
  );
};

interface Props extends WithTranslation {
  transactionStatus: TransactionStatusState;
  selectedAccount: Partial<PreferencesAccount>;
  messages: MessageStoreItem[];
  notifications: NotificationsStoreItem[][];
  message: MessageStoreItem;
  onClose: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onNext: (event?: React.MouseEvent<HTMLButtonElement>) => void;
  onList: (event?: React.MouseEvent<HTMLButtonElement>) => void;
  assets: Record<string, AssetDetail>;
  config: MessageConfig;
}

class FinalTransactionComponent extends React.PureComponent<Props> {
  render() {
    const {
      t,
      transactionStatus,
      selectedAccount,
      messages,
      notifications,
      message,
      onClose,
      onNext,
      onList,
      assets,
    } = this.props;

    const newMessages = messages
      .map(item => item.id)
      .filter(id => id !== message.id).length;
    const msgCount = newMessages + notifications.length;
    const isSend = message.broadcast;
    const isApprove = !!transactionStatus.approveOk;
    const isReject = !!transactionStatus.rejectOk;
    const isError = !!transactionStatus.approveError;
    const isShowNext = newMessages > 0;
    const isShowList = msgCount > 1 || notifications.length;
    const isShowClose = !isShowNext && !isShowList;
    const config = this.props.config;
    const FinalComponent = config.final;
    const Card = config.card;
    const isNotOrder = !isOrder(message.data, message.type);

    const network = selectedAccount && selectedAccount.networkCode;
    const explorerUrls = new Map([
      ['W', 'wavesexplorer.com'],
      ['T', 'testnet.wavesexplorer.com'],
      ['S', 'stagenet.wavesexplorer.com'],
      ['custom', 'wavesexplorer.com/custom'],
    ]);
    const explorer = explorerUrls.get(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      explorerUrls.has(network!) ? network! : 'custom'
    );
    const txLink = `https://${explorer}/tx/${message.messageHash}`;

    if (config.type === oauth.type && !isShowClose) {
      const method = isShowList ? 'onList' : 'onNext';
      this.props[method]();
      return null;
    }

    const showExtraButton =
      (isShowList && isShowClose) || (isShowNext && isShowList);

    return (
      <div className={styles.transaction}>
        <TxHeader {...this.props} hideButton={true} />

        <div className={cn(styles.finalTxScrollBox, 'transactionContent')}>
          {isReject || isApprove ? (
            <div
              className={cn(styles.txBigIcon, 'margin-main', {
                'tx-reject-icon': isReject,
                'tx-approve-icon': isApprove,
              })}
            />
          ) : null}

          <div className="margin-main-top margin-main-big">
            {isApprove || isReject ? (
              <div className="center">
                <FinalComponent
                  isApprove={isApprove}
                  isReject={isReject}
                  isSend={message.broadcast}
                  message={message}
                  assets={assets}
                />
              </div>
            ) : null}
            {isError ? (
              <div className="headline2">
                <Error approveError={transactionStatus.approveError} />
              </div>
            ) : null}
          </div>

          <Card message={message} assets={assets} collapsed={false} />

          {isSend && isApprove && isNotOrder && (
            <div className="center margin-main-big-top">
              <a
                rel="noopener noreferrer"
                className="link black"
                href={txLink}
                target="_blank"
              >
                {t('sign.viewTransaction')}
              </a>
            </div>
          )}
          {!isNotOrder && (
            <div className={`${styles.txRow} margin-main-top`}>
              <div className="basic500 tx-title tag1">
                {t('transactions.orderId')}
              </div>
              <div className="black">{message.messageHash}</div>
            </div>
          )}
        </div>

        <div
          className={cn(styles.txButtonsWrapper, {
            'buttons-wrapper': showExtraButton,
          })}
        >
          {isShowList ? (
            <Button type="button" onClick={onList}>
              {t('sign.pendingList')}
            </Button>
          ) : null}

          {isShowNext ? (
            <Button type="submit" view="submit" onClick={onNext}>
              {t('sign.nextTransaction')}
            </Button>
          ) : null}

          {isShowClose ? (
            <Button
              data-testid="closeTransaction"
              id="close"
              type="button"
              onClick={onClose}
            >
              {isError ? t('sign.understand') : null}
              {isReject || isApprove ? t('sign.close') : null}
            </Button>
          ) : null}
        </div>
      </div>
    );
  }
}

export const FinalTransaction = withTranslation()(FinalTransactionComponent);
