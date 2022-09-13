import { ACTION } from './constants';

export function setTab(tab: string | null) {
  return {
    type: ACTION.CHANGE_TAB,
    payload: tab,
  };
}

export function addBackTab(tab: string | null) {
  return {
    type: ACTION.ADD_BACK_TAB,
    payload: tab,
  };
}

export function removeBackTab() {
  return {
    type: ACTION.REMOVE_BACK_TAB,
  };
}
