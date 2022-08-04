import * as React from 'react';
import * as styles from './approveButtons.styl';
import { Button } from './Button';
import { CONFIG } from '../../../appConfig';
import cn from 'classnames';

interface State {
  pending?: boolean;
  timerEnd?: Date;
  currentTime?: Date;
  percentage?: number;
}

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  id?: string;
  view?: 'submit';
  disabled?: boolean;
  loading?: boolean;
  autoClickProtection?: boolean;
}

export class ApproveBtn extends React.PureComponent<Props, State> {
  readonly state: State = {};

  updateInterval = () => this._updateInterval(Date.now());
  _timeout;

  constructor(props) {
    super(props);
  }

  componentDidMount(): void {
    this.updateInterval();
  }

  render() {
    const { pending } = this.state;
    const { autoClickProtection, disabled, loading, ...restProps } = this.props;

    return (
      <Button
        {...restProps}
        disabled={disabled || loading || pending}
        loading={loading}
        className={cn(restProps.className, styles.hideText, styles.svgWrapper)}
      >
        {!loading && this.props.children}
      </Button>
    );
  }

  _updateInterval(currentTime) {
    if (!this.props.autoClickProtection) {
      return null;
    }
    const timerEnd =
      this.state.timerEnd || currentTime + CONFIG.MESSAGES_CONFIRM_TIMEOUT;
    this.setState({ timerEnd, currentTime });
    if (timerEnd >= currentTime) {
      clearTimeout(this._timeout);
      this._timeout = window.setTimeout(this.updateInterval, 100);
    }
  }

  static getDerivedStateFromProps(props, state) {
    const { timerEnd, currentTime } = state;
    const autoClickProtection = props.autoClickProtection;
    const pending =
      autoClickProtection && (!timerEnd || timerEnd > currentTime);
    const percentage = !timerEnd
      ? 0
      : 100 -
        Math.floor(
          ((timerEnd - currentTime) / CONFIG.MESSAGES_CONFIRM_TIMEOUT) * 100
        );
    return { ...props, pending, timerEnd, percentage };
  }
}
