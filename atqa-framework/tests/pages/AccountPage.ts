import { BasePage } from './BasePage';

export class AccountPage extends BasePage {
  public SELECTORS = {
    GET_STARTED_BUTTON: '$getStartedBtn',
    CREATE_PASSWORD_INPUT: {
      CREATE_PASSWORD: { xpath: '(//input)[1]' },
      CONFIRM_PASSWORD: { id: 'second' },
      CONTINUE_BUTTON: locate('button').withText('Continue'),
      ACCEPT_TERMS_CHECKBOX: { id: 'termsAccepted' },
      ACCEPT_CONDITIONS: { id: 'conditionsAccepted' },
    },
    ACCOUNTS: {
      ADD_ACCOUNT_BUTTON: { id: 'addAccountBtn' },
      ADD_KEYSTORE_BUTTON: { id: 'importKeystore' },
      KEYSTORE_FILE_INPUT: { id: 'fileInput' },
    },
  };
}
