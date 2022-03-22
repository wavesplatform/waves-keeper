import * as styles from './styles/assets.styl';
import * as React from 'react';
import { useState } from 'react';
import { ActiveAccountCard } from '../accounts/activeAccountCard';
import { Trans } from 'react-i18next';
import {
  getBalances,
  setActiveAccount,
  setSwapScreenInitialState,
  setUiState,
} from 'ui/actions';
import { PAGES } from 'ui/pageConfig';
import { Asset, Money } from '@waves/data-entities';
import { Modal, Tab, TabList, TabPanels, Tabs } from 'ui/components/ui';
import { Intro } from './Intro';
import { FeatureUpdateInfo } from './FeatureUpdateInfo';
import { useAppDispatch, useAppSelector } from 'ui/store';
import { AssetInfo } from './assets/assetInfo';
import { TabAssets } from './assets/tabs/tabAssets';
import { TabNfts } from './assets/tabs/tabNfts';
import { TabTxHistory } from './assets/tabs/tabTxHistory';
import { AssetDetail } from 'ui/services/Background';

interface Props {
  setTab: (newTab: string) => void;
}

export function Assets({ setTab }: Props) {
  const dispatch = useAppDispatch();

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
  const activeTab = useAppSelector(state => state.uiState?.assetsTab);

  const [showAsset, setShowAsset] = useState(false);
  const [showCopy, setShowCopy] = React.useState(false);

  const [currentAsset, setCurrentAsset] = [
    useAppSelector(state => state.uiState?.currentAsset),
    (assetId: AssetDetail) => dispatch(setUiState({ currentAsset: assetId })),
  ];

  const [currentTab, setCurrentTab] = [
    useAppSelector(state => state.uiState?.assetsTab || 0),
    (tabIndex: number) => dispatch(setUiState({ assetsTab: tabIndex })),
  ];

  const address = activeAccount && activeAccount.address;

  React.useEffect(() => {
    setCurrentAsset(null);
    if (!balances[address]) {
      dispatch(getBalances());
    }
  }, []);

  const onSelectHandler = account => {
    dispatch(setActiveAccount(account));
    setTab(PAGES.ACCOUNT_INFO);
  };

  if (!activeAccount) {
    return <Intro />;
  }

  const assetInfo = assets['WAVES'];

  let wavesBalance;
  if (assetInfo) {
    const asset = new Asset(assetInfo);
    wavesBalance = new Money(balances[address]?.available || 0, asset);
  }

  return (
    <div className={styles.assets}>
      <div className={styles.activeAccount}>
        <ActiveAccountCard
          account={activeAccount}
          balance={wavesBalance}
          onCopy={() => {
            setShowCopy(true);
            setTimeout(() => setShowCopy(false), 1000);
          }}
          onSwapClick={() => {
            setTab(PAGES.SWAP);
          }}
          onOtherAccountsClick={() => {
            setTab(PAGES.OTHER_ACCOUNTS);
          }}
          onClick={onSelectHandler}
          onShowQr={() => {
            setTab(PAGES.QR_CODE_SELECTED);
          }}
        />
      </div>

      <Tabs
        activeTab={activeTab}
        onTabChange={activeIndex =>
          activeIndex !== currentTab && setCurrentTab(activeIndex)
        }
      >
        <TabList className="flex body3">
          <Tab className={styles.tabItem}>
            <Trans i18nKey="assets.assets" />
          </Tab>
          <Tab className={styles.tabItem}>
            <Trans i18nKey="assets.nfts" />
          </Tab>
          <Tab className={styles.tabItem}>
            <Trans i18nKey="assets.history" />
          </Tab>
        </TabList>
        <TabPanels className={styles.tabPanels}>
          <TabAssets
            onInfoClick={assetId => {
              setCurrentAsset(assets[assetId]);
              setShowAsset(true);
            }}
            onSendClick={assetId => {
              setCurrentAsset(assets[assetId]);
              setTab(PAGES.SEND);
            }}
            onSwapClick={assetId => {
              dispatch(setSwapScreenInitialState({ fromAssetId: assetId }));
              setTab(PAGES.SWAP);
            }}
          />
          <TabNfts
            onInfoClick={assetId => {
              setCurrentAsset(assets[assetId]);
              setShowAsset(true);
            }}
            onSendClick={assetId => {
              setCurrentAsset(assets[assetId]);
              setTab(PAGES.SEND);
            }}
          />
          <TabTxHistory />
        </TabPanels>
      </Tabs>

      <Modal animation={Modal.ANIMATION.FLASH_SCALE} showModal={showCopy}>
        <div className="modal notification">
          <Trans i18nKey="assets.copied" />
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
        showModal={currentAsset && showAsset}
        onExited={() => setCurrentAsset(null)}
      >
        <AssetInfo
          asset={currentAsset}
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
