import * as React from 'react';
import { routes } from '../../accounts/routes';
import { ACCOUNTS_PAGES } from '../../accounts/pages';
import { useAccountsSelector } from 'accounts/store';
import { Navigate, useNavigate } from 'ui/router';
import { Login } from './pages/Login';
import { Welcome } from './pages/Welcome';

export function RootAccounts() {
  const navigate = useNavigate();
  const currentPage = useAccountsSelector(state => state.router.currentPage);

  const initialized = useAccountsSelector(state => state.state?.initialized);
  const locked = useAccountsSelector(state => state.state?.locked);

  const currentNetwork = useAccountsSelector(state => state.currentNetwork);
  const prevNetworkRef = React.useRef(currentNetwork);
  React.useEffect(() => {
    if (currentNetwork === prevNetworkRef.current) {
      return;
    }

    navigate(ACCOUNTS_PAGES.HOME, { replace: true });
    prevNetworkRef.current = currentNetwork;
  }, [currentNetwork, navigate]);

  if (!initialized && currentPage !== ACCOUNTS_PAGES.NEW) {
    return <Welcome />;
  }

  if (initialized && locked && currentPage !== ACCOUNTS_PAGES.FORGOT) {
    return <Login />;
  }

  if (initialized && !locked && currentPage === ACCOUNTS_PAGES.FORGOT) {
    return <Navigate to={ACCOUNTS_PAGES.HOME} />;
  }

  return routes.find(route => route.path === currentPage)?.element ?? null;
}
