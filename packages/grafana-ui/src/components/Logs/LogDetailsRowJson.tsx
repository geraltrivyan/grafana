import { css } from '@emotion/css';
import React, { PureComponent } from 'react';

import { GrafanaTheme2 } from '@grafana/data';

import { withTheme2 } from '../../themes/index';
import { Themeable2 } from '../../types/theme';
import { Icon } from '../Icon/Icon';

import { restructureLog } from './LogRowMessage';

export interface Props extends Themeable2 {
  jsonValue: string;
}
interface State {
  hideTree: boolean;
}

function encodeHTMLEntities(rawStr) {
  return rawStr.replace(/[\u00A0-\u9999<>\&]/g, (i) => `&#${i.charCodeAt(0)};`);
}

const getStyles = (theme: GrafanaTheme2) => {
  return {
    topVerticalAlign: css`
      vertical-align: top;
      display: inline-block;
      fill: currentcolor;
      margin-top: -${theme.spacing(0.9)};
      margin-left: -${theme.spacing(0.25)};
    `,
  };
};

class UnThemedLogDetailsRowJson extends PureComponent<Props, State> {
  state: State = {
    hideTree: false,
  };

  render() {
    const { theme, jsonValue, first } = this.props;

    const { hideTree } = this.state;

    const styles = getStyles(theme);

    const isJson = (json) => {
      return !(json && typeof json !== 'object');
    };

    const objectLength = (json) => {
      if (!json || !isJson(json)) {
        return '';
      }

      let bracerStart = '{';
      let bracerEnd = '}';

      if (Array.isArray(json)) {
        bracerStart = '[';
        bracerEnd = ']';
      }

      return ` ${bracerStart}${Object.keys(json).length}${bracerEnd}`;
    };

    const toggleContainerVisibility = () => {
      this.setState({ hideTree: !this.state.hideTree });
    };

    const findParentContainer = (node) => {
      if (node.dataset?.container === 'true') {
        return node;
      }

      return findParentContainer(node.parentNode);
    };

    const toggleCopyVisibility = (event) => {
      const container = findParentContainer(event.target);

      if (!container) {
        return;
      }

      let icon = container.lastChild.lastChild;

      icon.style.visibility = event.type === 'mouseenter' ? 'visible' : 'hidden';
      icon.style.border = '';
    };

    const copyValue = (event) => {
      const container = findParentContainer(event.target);

      if (!container) {
        return;
      }

      const text = container.firstElementChild.innerText;

      navigator.clipboard.writeText(text);
      container.lastElementChild.firstElementChild.style.border = 'green 1px solid';
    };

    const showValue = (value) => {
      if (value === null) {
        return 'null';
      }

      if (typeof value === 'boolean') {
        return value ? 'true' : 'false';
      }

      if (typeof value === undefined) {
        return 'undefined';
      }

      return value;
    };

    return (
      <div style={{ paddingLeft: first ? ' 0em' : '2em' }}>
        {Object.entries(jsonValue).map(([key, value]) => {
          const jsonValue = isJson(value);
          return (
            <>
              {(!jsonValue || value === null) && (
                <div
                  onMouseEnter={toggleCopyVisibility}
                  onMouseLeave={toggleCopyVisibility}
                  style={{ marginBottom: '3px' }}
                  data-container="true"
                >
                  {key}: <span>{showValue(value)}</span>
                  <Icon
                    className={styles.topVerticalAlign}
                    name="copy"
                    onClick={copyValue}
                    style={{ visibility: 'hidden', verticalAlign: 'top', marginLeft: '5px', borderRadius: '5px' }}
                  />
                </div>
              )}
              {jsonValue && value && (
                <>
                  <div style={{ marginBottom: '3px' }} onClick={toggleContainerVisibility}>
                    <span>
                      <Icon className={styles.topVerticalAlign} name={!hideTree ? 'angle-down' : 'angle-right'} />
                    </span>
                    {key}
                    {objectLength(value)}
                  </div>
                  {!hideTree && <LogDetailsRowJson theme={theme} jsonValue={value} first={false} />}
                </>
              )}
            </>
          );
        })}
      </div>
    );
  }
}

export const LogDetailsRowJson = withTheme2(UnThemedLogDetailsRowJson);
LogDetailsRowJson.displayName = 'LogDetailsRowJson';
