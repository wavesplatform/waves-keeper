import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from 'ui/store';
import { login } from '../../actions/localState';
import { BigLogo } from '../head';
import { Button, Error, Input } from '../ui';
import * as styles from './styles/login.styl';

export function Login() {
  const { t } = useTranslation();

  const dispatch = useAppDispatch();
  const error = useAppSelector(state => state.localState.login.error);

  const navigate = useNavigate();

  const [password, setPassword] = React.useState('');

  return (
    <div className={styles.content}>
      <div className={styles.logoMargin}>
        <BigLogo />
      </div>

      <form
        onSubmit={event => {
          event.preventDefault();
          dispatch(login(password));
        }}
      >
        <div className="left input-title basic500 tag1">
          {t('login.password')}
        </div>

        <div className="margin-main-big relative">
          <Input
            autoComplete="off"
            autoFocus
            error={!!error}
            id="loginPassword"
            type="password"
            value={password}
            view="password"
            onChange={event => {
              setPassword(event.target.value);
            }}
          />

          <Error show={!!error} data-testid="loginPasswordError">
            {t('login.passwordError')}
          </Error>
        </div>

        <Button
          id="loginEnter"
          type="submit"
          view="submit"
          className="margin4"
          disabled={!password}
        >
          {t('login.enter')}
        </Button>
      </form>

      <div>
        <div
          className={styles.forgotLnk}
          onClick={() => {
            navigate('/forgot-password');
          }}
        >
          {t('login.passwordForgot')}
        </div>
      </div>
    </div>
  );
}
