import * as Sentry from '@sentry/react';
import * as React from 'react';
import { useAppSelector } from 'ui/store';
import { LoadingScreen } from './pages/loadingScreen';
import { Error } from './pages/Error';

interface Props {
  children: React.ReactNode;
}

export function RootWrapper({ children }: Props) {
  const currentLocale = useAppSelector(state => state.currentLocale);
  const isLoading = useAppSelector(state => state.localState.loading);

  return (
    <Sentry.ErrorBoundary fallback={errorData => <Error {...errorData} />}>
      <div className="app">
        <div className={`height ${currentLocale}`}>
          {isLoading ? <LoadingScreen /> : children}
        </div>
      </div>
    </Sentry.ErrorBoundary>
  );
}
