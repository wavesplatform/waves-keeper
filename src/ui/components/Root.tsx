import * as Sentry from '@sentry/react';
import * as React from 'react';
import { Menu } from './menu';
import { Bottom } from './bottom';
import { PAGES, PAGES_CONF } from '../pageConfig';
import { useAppSelector } from 'ui/store';
import { LoadingScreen } from './pages';

export function Root() {
  const currentLocale = useAppSelector(state => state.currentLocale);
  const isLoading = useAppSelector(state => state.localState.loading);
  const currentPage = useAppSelector(state => {
    let page = state.router.currentPage;

    if (
      !state.state?.locked &&
      page !== PAGES.CHANGE_TX_ACCOUNT &&
      state.accounts.length
    ) {
      if (state.activePopup && state.activePopup.msg) {
        page = PAGES.MESSAGES;
      } else if (state.activePopup && state.activePopup.notify) {
        page = PAGES.NOTIFICATIONS;
      } else if (state.messages.length + state.notifications.length) {
        page = PAGES.MESSAGES_LIST;
      }
    }

    let canUsePage = !state.state?.locked;

    switch (page) {
      case PAGES.LOGIN:
      case PAGES.FORGOT:
        canUsePage = Boolean(state.state?.initialized && state.state?.locked);
        break;
      case PAGES.ASSETS:
        canUsePage = !state.state?.locked && state.accounts.length !== 0;
        break;
    }

    if (!page || !canUsePage) {
      page = state.state?.locked
        ? state.state?.initialized
          ? PAGES.LOGIN
          : PAGES.WELCOME
        : state.accounts.length
        ? PAGES.ASSETS
        : PAGES.IMPORT_POPUP;
    }

    return page;
  });

  const prevPageRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    const prevPage = prevPageRef.current;

    Sentry.addBreadcrumb({
      type: 'navigation',
      category: 'navigation',
      level: Sentry.Severity.Info,
      data: {
        from: prevPage,
        to: currentPage,
      },
    });

    prevPageRef.current = currentPage;
  }, [currentPage]);

  const pageConf = PAGES_CONF[currentPage];
  const Component = pageConf.component;

  return (
    <div className={`height ${currentLocale}`}>
      {isLoading ? (
        <LoadingScreen />
      ) : (
        <>
          <Menu
            hasBack={pageConf.menu?.back}
            hasClose={pageConf.menu?.close}
            hasLogo={pageConf.menu?.hasLogo}
            hasSettings={pageConf.menu?.hasSettings}
          />
          <Component />
          <Bottom
            hide={pageConf.bottom?.hide}
            noChangeNetwork={pageConf.bottom?.noChangeNetwork}
          />
        </>
      )}
    </div>
  );
}
