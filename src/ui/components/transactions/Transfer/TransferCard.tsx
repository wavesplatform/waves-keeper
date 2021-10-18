import * as styles from './transfer.styl';
import * as React from 'react';
import { Trans } from 'react-i18next';
import { TxIcon } from '../TransactionIcon';
import cn from 'classnames';
import { Balance } from '../../ui';
import { getMoney } from '../../../utils/converters';
import { getAmount, messageType } from './parseTx';

export class TransferCard extends React.PureComponent<ITransfer> {
    render() {
        const className = cn(styles.transferTransactionCard, this.props.className, {
            [styles.transferCard_collapsed]: this.props.collapsed,
        });

        const { message, assets } = this.props;
        const { data = {} } = message;
        const tx = { type: data.type, ...data.data };
        const amount = getMoney(getAmount(tx), assets);

        return (
            <div className={className}>
                <div className={styles.cardHeader}>
                    <div className={styles.transferTxIcon}>
                        <TxIcon txType={messageType} />
                    </div>
                    <div>
                        <div className="basic500 body3 margin-min">
                            <Trans i18nKey="transactions.transfer">Send</Trans>
                        </div>
                        <h1 className="headline1">
                            <Balance
                                split={true}
                                addSign="- "
                                showAsset={true}
                                balance={amount}
                                className={styles.txBalanceWrapper}
                            />
                        </h1>
                    </div>
                </div>

                <div className={styles.cardContent} />
            </div>
        );
    }
}

interface ITransfer {
    assets: any;
    className: string;
    collapsed: boolean;
    message: any;
}
