import * as styles from './cancelLease.styl';
import * as React from 'react';

import { CancelLeaseCard } from './CancelLeaseCard';
import { TxDetailTabs, TxFooter, TxHeader, TxInfo } from '../BaseTransaction';
import { MessageComponentProps } from '../types';

export function CancelLease(props: MessageComponentProps) {
  return (
    <div className={styles.transaction}>
      <TxHeader {...props} />

      <div className={`${styles.cancelLeaseTxScrollBox} transactionContent`}>
        <div className="margin-main">
          <CancelLeaseCard {...props} />
        </div>

        <TxDetailTabs>
          <TxInfo />
        </TxDetailTabs>
      </div>

      <TxFooter {...props} />
    </div>
  );
}
