import * as styles from './auth.styl';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { AuthCard } from './AuthCard';
import { AuthInfo } from './AuthInfo';
import { ApproveBtn, Button } from '../../ui';
import { TxHeader } from '../BaseTransaction';
import { SignWrapper } from '../../pages/importEmail/signWrapper';
import { useAppSelector } from 'ui/store';
import { MessageComponentProps } from '../types';

export function Auth(props: MessageComponentProps) {
  const { t } = useTranslation();
  const status = useAppSelector(state => state.localState.transactionStatus);

  const { message, assets } = props;

  return (
    <div className={styles.transaction}>
      <TxHeader {...props} />

      <div className={`${styles.authTxScrollBox} transactionContent`}>
        <div className="margin-main">
          <AuthCard {...props} />
        </div>

        <AuthInfo message={message} assets={assets} />
      </div>

      <div className={`${styles.txButtonsWrapper} buttons-wrapper`}>
        <Button id="reject" onClick={props.reject} type="button" view="warning">
          {t('sign.reject')}
        </Button>
        <SignWrapper
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onConfirm={props.approve as any}
        >
          {({ onPrepare, pending }) => (
            <ApproveBtn
              id="approve"
              type="submit"
              view="submit"
              loading={pending || status.approvePending}
              onClick={onPrepare}
            >
              {t('sign.auth')}
            </ApproveBtn>
          )}
        </SignWrapper>
      </div>
    </div>
  );
}
