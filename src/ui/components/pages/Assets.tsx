import * as styles from './styles/assets.styl';
import cn from 'classnames';
import * as React from 'react';
import { useState } from 'react';
import { ActiveAccountCard } from '../accounts/activeAccountCard';
import { Trans, useTranslation } from 'react-i18next';
import {
  getAsset,
  getBalances,
  setActiveAccount,
  setUiState,
} from '../../actions';
import { PAGES } from '../../pageConfig';
import { Asset, Money } from '@waves/data-entities';
import {
  Button,
  BUTTON_TYPE,
  Input,
  Modal,
  Select,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from '../ui';
import { Intro } from './Intro';
import { FeatureUpdateInfo } from './FeatureUpdateInfo';
import { useAppDispatch, useAppSelector } from 'ui/store';
import { BigNumber } from '@waves/bignumber';
import { AssetItem } from './assets/assetItem';
import { NftItem } from './assets/nftItem';
import { AssetInfo } from './assets/assetInfo';
import { HistoryItem } from './assets/historyItem';
import {
  ITransaction,
  WithId,
} from '@waves/waves-transactions/dist/transactions';
import { TRANSACTION_TYPE } from '@waves/ts-types';
import { colors } from './assets/helpers';

const MONTH = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

function SearchInput({ value, onInput, onClear }) {
  const input = React.createRef<Input>();

  return (
    <div className={cn('flex grow', styles.searchInputWrapper)}>
      <Input
        ref={input}
        className={cn(styles.searchInput, 'font300')}
        onInput={onInput}
        value={value}
        spellCheck={false}
      />
      {value && (
        <Button
          className={styles.searchClose}
          type={BUTTON_TYPE.CUSTOM}
          onClick={() => {
            input.current.focus();
            onClear();
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              width="18"
              height="18"
              fill="currentColor"
              fillOpacity="0.01"
            />
            <path
              d="M10.1523 9L14.7614 4.39091C15.0795 4.07272 15.0795 3.55683 14.7614 3.23864C14.4432 2.92045 13.9273 2.92045 13.6091 3.23864L9 7.84773L4.39091 3.23864C4.07272 2.92045 3.55683 2.92045 3.23864 3.23864C2.92045 3.55683 2.92045 4.07272 3.23864 4.39091L7.84773 9L3.23864 13.6091C2.92045 13.9273 2.92045 14.4432 3.23864 14.7614C3.55683 15.0795 4.07272 15.0795 4.39091 14.7614L9 10.1523L13.6091 14.7614C13.9273 15.0795 14.4432 15.0795 14.7614 14.7614C15.0795 14.4432 15.0795 13.9273 14.7614 13.6091L10.1523 9Z"
              fill="currentColor"
            />
          </svg>
        </Button>
      )}
    </div>
  );
}

interface Props {
  setTab: (newTab: string) => void;
}

export function Assets({ setTab }: Props) {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const activeAccount = useAppSelector(state =>
    state.accounts.find(
      ({ address }) => address === state.selectedAccount.address
    )
  );
  const assets = useAppSelector(state => state.assets);
  const balances = useAppSelector(state => state.balances);
  const notifications = useAppSelector(state => state.localState.notifications);
  const showUpdateInfo = useAppSelector(
    state => !state.uiState.isFeatureUpdateShown && !!state.accounts.length
  );

  const [asset, setAsset] = useState(null);
  const [showAsset, setShowAsset] = useState(false);
  const [showCopy, setShowCopy] = React.useState(false);

  React.useEffect(() => {
    if (!assets['WAVES']) {
      dispatch(getAsset('WAVES'));
    }
  }, [assets, dispatch]);

  const address = activeAccount && activeAccount.address;
  const txHistory = balances[address]?.txHistory;
  const myAssets = balances[address]?.assets;
  const myNfts = balances[address]?.nfts;
  const addressAlias = [address, ...(balances[address]?.aliases || [])];

  React.useEffect(() => {
    dispatch(getBalances());
  }, []);

  const onSelectHandler = account => {
    dispatch(setActiveAccount(account));
    setTab(PAGES.ACCOUNT_INFO);
  };

  if (!activeAccount) {
    return <Intro />;
  }

  const balancesMoney: Record<string, Money> = {};

  const assetInfo = assets['WAVES'];

  if (assetInfo) {
    const asset = new Asset(assetInfo);

    Object.entries<{ available: string }>(balances).forEach(
      ([address, { available }]) => {
        balancesMoney[address] = new Money(available, asset);
      }
    );
  }

  const [assetTerm, setAssetTerm] = useState('');
  const [onlyMyAssets, setOnlyMyAssets] = useState(false);
  const assetEntries = Object.entries<{ balance: string }>(myAssets || {})
    .filter(
      ([assetId]) =>
        (!onlyMyAssets || (assets && assets[assetId]?.issuer === address)) &&
        (!assetTerm ||
          assetId === assetTerm ||
          (
            assets && (assets[assetId]?.displayName ?? '').toLowerCase()
          ).indexOf(assetTerm.toLowerCase()) !== -1)
    )
    .sort(
      ([a], [b]) =>
        assets &&
        assets[a] &&
        assets[b] &&
        (assets[a].isFavorite < assets[b].isFavorite
          ? 1
          : assets[a].isFavorite > assets[b].isFavorite
          ? -1
          : 0)
    );

  const [nftTerm, setNftTerm] = useState('');
  const [onlyMyNfts, setOnlyMyNfts] = useState(false);
  const nftEntries = Object.entries<Asset[]>(
    (myNfts || [])
      .filter(
        nft =>
          (!onlyMyNfts || nft.issuer === address) &&
          (!nftTerm ||
            nft.id === nftTerm ||
            nft.displayName.toLowerCase().indexOf(nftTerm.toLowerCase()) !== -1)
      )
      .reduce(
        (result, item) => ({
          ...result,
          [item.issuer]: [...(result[item.issuer] || []), item],
        }),
        {}
      )
  );

  const [txHistoryTerm, setTxHistoryTerm] = useState('');
  const [txHistoryType, setTxHistoryType] = useState(null);
  const [txHistoryIncoming, setTxHistoryIncoming] = useState(false);
  const [txHistoryOutgoing, setTxHistoryOutgoing] = useState(false);
  const thisYear = new Date().getFullYear();
  const historyEntries = Object.entries<Array<ITransaction & WithId>>(
    (txHistory || [])
      .filter(
        (
          tx: any // TODO better types
        ) => {
          const hasMassTransfers = (tx.transfers ?? []).reduce(
            (
              result: boolean,
              transfer: { amount: number; recipient: string }
            ) => result || addressAlias.includes(transfer.recipient),
            false
          );
          const hasInvokePayments = (tx.payments ?? []).length !== 0;
          const hasInvokeTransfers = (tx.stateChanges?.transfer ?? []).reduce(
            (
              result: boolean,
              transfer: {
                address: string;
                asset: string;
                amount: string | number;
              }
            ) => result || addressAlias.includes(transfer.address),
            false
          );

          return (
            (!txHistoryTerm ||
              tx.id === txHistoryTerm ||
              tx.assetId === txHistoryTerm ||
              (assets &&
                (assets[tx.assetId]?.displayName ?? '')
                  .toLowerCase()
                  .indexOf(txHistoryTerm.toLowerCase()) !== -1) ||
              tx.sender === txHistoryTerm ||
              tx.recipient === txHistoryTerm ||
              (tx.alias ?? '')
                .toLowerCase()
                .indexOf(txHistoryTerm.toLowerCase()) !== -1 ||
              (tx.call?.function ?? '')
                .toLowerCase()
                .indexOf(txHistoryTerm.toLowerCase()) !== -1) &&
            (!txHistoryType || tx.type === txHistoryType) &&
            (!txHistoryIncoming ||
              (!addressAlias.includes(tx.sender) &&
                (addressAlias.includes(tx.recipient) || hasMassTransfers)) ||
              hasInvokeTransfers) &&
            (!txHistoryOutgoing ||
              (tx.type === TRANSACTION_TYPE.TRANSFER &&
                addressAlias.includes(tx.sender)) ||
              (tx.type === TRANSACTION_TYPE.MASS_TRANSFER &&
                !hasMassTransfers) ||
              (tx.type === TRANSACTION_TYPE.INVOKE_SCRIPT && hasInvokePayments))
          );
        }
      )
      .reduce((result, tx) => {
        const d = new Date(tx.timestamp);
        const [year, month, day] = [d.getFullYear(), d.getMonth(), d.getDate()];
        const date = `${(year !== thisYear && year) || ''} ${t(
          `date.${MONTH[month]}`
        )} ${day}`;
        return {
          ...result,
          [date]: [...(result[date] || []), tx],
        };
      }, {})
  );

  return (
    <div className={styles.assets}>
      <div className={styles.activeAccount}>
        <ActiveAccountCard
          account={activeAccount}
          balance={balancesMoney[address]}
          onCopy={() => {
            setShowCopy(true);
            setTimeout(() => setShowCopy(false), 1000);
          }}
          onOtherAccountsClick={() => {
            setTab(PAGES.OTHER_ACCOUNTS);
          }}
          onClick={onSelectHandler}
          onSendClick={() => {
            setTab(PAGES.SEND);
          }}
          onShowQr={() => {
            setTab(PAGES.QR_CODE_SELECTED);
          }}
        />
      </div>

      <Tabs>
        <TabList className={cn(styles.tabs, 'body3')}>
          <Tab>
            <Trans i18nKey="assets.assets" />
          </Tab>
          <Tab>
            <Trans i18nKey="assets.nfts" />
          </Tab>
          <Tab>
            <Trans i18nKey="assets.history" />
          </Tab>
        </TabList>
        <TabPanels className={styles.tabPanels}>
          <TabPanel>
            <div className="flex margin1">
              <SearchInput
                value={assetTerm}
                onInput={e => setAssetTerm(e.target.value)}
                onClear={() => setAssetTerm('')}
              />
              <div
                className={cn('showTooltip', styles.filterBtn)}
                onClick={() => setOnlyMyAssets(!onlyMyAssets)}
              >
                <svg
                  width="14"
                  height="14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill={onlyMyAssets ? colors.submit400 : colors.basic500}
                    fillOpacity=".01"
                    d="M0 0h14v14H0z"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M7 5.6c1.534 0 2.778-1.254 2.778-2.8C9.778 1.254 8.534 0 7 0S4.222 1.254 4.222 2.8c0 1.546 1.244 2.8 2.778 2.8Zm-5 6.16c.003-2.782 2.24-5.037 5-5.04 2.76.003 4.997 2.258 5 5.04v1.68c0 .31-.249.56-.556.56H2.556A.558.558 0 0 1 2 13.44v-1.68Z"
                    fill={onlyMyAssets ? colors.submit400 : colors.basic500}
                  />
                </svg>
              </div>
              <div className={cn(styles.filterTooltip, 'tooltip')}>
                <Trans i18nKey="assets.onlyMyAssets" />
              </div>
            </div>

            {assetEntries.length === 0 ? (
              <div className="basic500 center margin-min-top">
                <Trans i18nKey="assets.emptyAssets" />
              </div>
            ) : (
              assetEntries.map(([assetId, { balance }]) => (
                <AssetItem
                  key={assetId}
                  balance={
                    assets &&
                    assets[assetId] &&
                    new Money(
                      new BigNumber(balance),
                      new Asset(assets[assetId])
                    )
                  }
                  assetId={assetId}
                  onClick={assetId => {
                    setAsset(assets[assetId]);
                    setShowAsset(true);
                  }}
                />
              ))
            )}
          </TabPanel>
          <TabPanel>
            <div className="flex grow margin1">
              <SearchInput
                value={nftTerm}
                onInput={e => setNftTerm(e.target.value)}
                onClear={() => setNftTerm('')}
              />
              <div
                className={cn('showTooltip', styles.filterBtn)}
                onClick={() => setOnlyMyNfts(!onlyMyNfts)}
              >
                <svg
                  width="14"
                  height="14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill={onlyMyNfts ? colors.submit400 : colors.basic500}
                    fillOpacity=".01"
                    d="M0 0h14v14H0z"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M7 5.6c1.534 0 2.778-1.254 2.778-2.8C9.778 1.254 8.534 0 7 0S4.222 1.254 4.222 2.8c0 1.546 1.244 2.8 2.778 2.8Zm-5 6.16c.003-2.782 2.24-5.037 5-5.04 2.76.003 4.997 2.258 5 5.04v1.68c0 .31-.249.56-.556.56H2.556A.558.558 0 0 1 2 13.44v-1.68Z"
                    fill={onlyMyNfts ? colors.submit400 : colors.basic500}
                  />
                </svg>
              </div>
              <div className={cn(styles.filterTooltip, 'tooltip')}>
                <Trans i18nKey="assets.onlyMyNfts" />
              </div>
            </div>
            {nftEntries.length === 0 ? (
              <div className="basic500 center margin-min-top">
                <Trans i18nKey="assets.emptyNFTs" />
              </div>
            ) : (
              nftEntries.map(([issuer, issuerNfts], index) => (
                <div
                  key={issuer}
                  className={index === 0 ? 'margin-min-top' : 'margin-main-top'}
                >
                  <div className="basic500 margin-min">
                    <Trans i18nKey="assets.issuedBy" values={{ issuer }} />
                  </div>
                  {issuerNfts.map(nft => (
                    <NftItem
                      key={nft.id}
                      asset={nft}
                      onClick={assetId => {
                        setAsset(myNfts.find(nft => nft.id === assetId));
                        setShowAsset(true);
                      }}
                    />
                  ))}
                </div>
              ))
            )}
          </TabPanel>
          <TabPanel>
            <div className="flex grow margin1">
              <SearchInput
                value={txHistoryTerm}
                onInput={e => setTxHistoryTerm(e.target.value)}
                onClear={() => setTxHistoryTerm('')}
              />
              <Select
                className={cn('showTooltip', styles.filterTxSelect)}
                selected={txHistoryType}
                onSelectItem={(id, value) => setTxHistoryType(value)}
                selectList={[
                  {
                    id: null,
                    value: null,
                    text: t('historyFilters.all'),
                  },
                  {
                    id: TRANSACTION_TYPE.ISSUE,
                    value: TRANSACTION_TYPE.ISSUE,
                    text: t('historyFilters.issue'),
                  },
                  {
                    id: TRANSACTION_TYPE.TRANSFER,
                    value: TRANSACTION_TYPE.TRANSFER,
                    text: t('historyFilters.transfer'),
                  },
                  {
                    id: TRANSACTION_TYPE.REISSUE,
                    value: TRANSACTION_TYPE.REISSUE,
                    text: t('historyFilters.reissue'),
                  },
                  {
                    id: TRANSACTION_TYPE.BURN,
                    value: TRANSACTION_TYPE.BURN,
                    text: t('historyFilters.burn'),
                  },
                  {
                    id: TRANSACTION_TYPE.EXCHANGE,
                    value: TRANSACTION_TYPE.EXCHANGE,
                    text: t('historyFilters.exchange'),
                  },
                  {
                    id: TRANSACTION_TYPE.LEASE,
                    value: TRANSACTION_TYPE.LEASE,
                    text: t('historyFilters.lease'),
                  },
                  {
                    id: TRANSACTION_TYPE.CANCEL_LEASE,
                    value: TRANSACTION_TYPE.CANCEL_LEASE,
                    text: t('historyFilters.cancelLease'),
                  },
                  {
                    id: TRANSACTION_TYPE.ALIAS,
                    value: TRANSACTION_TYPE.ALIAS,
                    text: t('historyFilters.alias'),
                  },
                  {
                    id: TRANSACTION_TYPE.MASS_TRANSFER,
                    value: TRANSACTION_TYPE.MASS_TRANSFER,
                    text: t('historyFilters.massTransfer'),
                  },
                  {
                    id: TRANSACTION_TYPE.DATA,
                    value: TRANSACTION_TYPE.DATA,
                    text: t('historyFilters.data'),
                  },
                  {
                    id: TRANSACTION_TYPE.SET_SCRIPT,
                    value: TRANSACTION_TYPE.SET_SCRIPT,
                    text: t('historyFilters.setScript'),
                  },
                  {
                    id: TRANSACTION_TYPE.SPONSORSHIP,
                    value: TRANSACTION_TYPE.SPONSORSHIP,
                    text: t('historyFilters.sponsorship'),
                  },
                  {
                    id: TRANSACTION_TYPE.SET_ASSET_SCRIPT,
                    value: TRANSACTION_TYPE.SET_ASSET_SCRIPT,
                    text: t('historyFilters.setAssetScript'),
                  },
                  {
                    id: TRANSACTION_TYPE.INVOKE_SCRIPT,
                    value: TRANSACTION_TYPE.INVOKE_SCRIPT,
                    text: t('historyFilters.invokeScript'),
                  },
                  {
                    id: TRANSACTION_TYPE.UPDATE_ASSET_INFO,
                    value: TRANSACTION_TYPE.UPDATE_ASSET_INFO,
                    text: t('historyFilters.updateAssetInfo'),
                  },
                ]}
              />
              <div className={cn(styles.filterTxTooltip, 'tooltip')}>
                <Trans i18nKey="historyFilters.type" />
              </div>

              <div
                className={cn('showTooltip', styles.filterBtn)}
                onClick={() => setTxHistoryIncoming(!txHistoryIncoming)}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3.5 8.75L7 12.25M7 12.25L10.5 8.75M7 12.25V1.75"
                    stroke={txHistoryIncoming ? colors.in : colors.basic500}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className={cn(styles.filterIncomingTooltip, 'tooltip')}>
                <Trans i18nKey="historyFilters.incoming" />
              </div>

              <div
                className={cn('showTooltip', styles.filterBtn)}
                onClick={() => setTxHistoryOutgoing(!txHistoryOutgoing)}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3.5 5.25L7 1.75M7 1.75L10.5 5.25M7 1.75V12.25"
                    stroke={txHistoryOutgoing ? colors.out : colors.basic500}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className={cn(styles.filterTooltip, 'tooltip')}>
                <Trans i18nKey="historyFilters.outgoing" />
              </div>
            </div>
            {!historyEntries.length ? (
              <div className="basic500 center margin-min-top">
                <Trans i18nKey="assets.emptyHistory" />
              </div>
            ) : (
              historyEntries.map(([date, txArr], index) => (
                <div
                  key={date}
                  className={index === 0 ? 'margin-min-top' : 'margin-main-top'}
                >
                  <div className="basic500 margin-min">{date}</div>
                  {txArr.map(tx => (
                    <HistoryItem key={tx.id} tx={tx} />
                  ))}
                </div>
              ))
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>

      <Modal animation={Modal.ANIMATION.FLASH_SCALE} showModal={showCopy}>
        <div className="modal notification">
          <Trans i18nKey="assets.copied" />
        </div>
      </Modal>

      <Modal
        animation={Modal.ANIMATION.FLASH_SCALE}
        showModal={notifications.accountCreationSuccess}
      >
        <div className="modal notification">
          <div>
            <Trans i18nKey="assets.accountCreationSuccessNotification" />
          </div>
        </div>
      </Modal>

      <Modal
        animation={Modal.ANIMATION.FLASH_SCALE}
        showModal={notifications.accountImportSuccess}
      >
        <div className="modal notification">
          <div>
            <Trans i18nKey="assets.accountImportSuccessNotification" />
          </div>
        </div>
      </Modal>

      <Modal
        animation={Modal.ANIMATION.FLASH_SCALE}
        showModal={notifications.selected}
      >
        <div className="modal notification">
          <div>
            <Trans i18nKey="assets.selectAccountNotification" />
          </div>
        </div>
      </Modal>

      <Modal
        animation={Modal.ANIMATION.FLASH_SCALE}
        showModal={notifications.deleted}
      >
        <div className="modal notification active-asset">
          <div>
            <Trans i18nKey="assets.deleteAccount" />
          </div>
        </div>
      </Modal>

      <Modal
        animation={Modal.ANIMATION.FLASH}
        showModal={showAsset}
        onExited={() => setAsset(null)}
      >
        <AssetInfo
          asset={asset}
          onCopy={() => {
            setShowCopy(true);
            setTimeout(() => setShowCopy(false), 1000);
          }}
          onClose={() => setShowAsset(false)}
        />
      </Modal>

      <Modal animation={Modal.ANIMATION.FLASH} showModal={showUpdateInfo}>
        <FeatureUpdateInfo
          onClose={() => {
            dispatch(setUiState({ isFeatureUpdateShown: true }));
          }}
          onSubmit={() => {
            dispatch(setUiState({ isFeatureUpdateShown: true }));
            setTab(PAGES.EXPORT_ACCOUNTS);
          }}
        />
      </Modal>
    </div>
  );
}
