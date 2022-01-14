import React, { useEffect } from 'react';
import { Trans } from '@lingui/macro';
import {
  Box,
  Typography,
  Tabs,
} from '@material-ui/core';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { FormatLargeNumber } from '@hddcoin/core';
import StandardWallet from './standard/WalletStandard';
import type { RootState } from '../../../modules/rootReducer';
import LayoutMain from '../../layout/LayoutMain';
import { useHistory, useRouteMatch, useParams } from 'react-router-dom';

const StyledTabs = styled(Tabs)`
  flex-grow: 1;
  box-shadow: inset 0 -1px 0 ${({ theme }) => theme.palette.type === 'dark' ? '#222222' : '#DBDBDB'};
`;

export function StatusCard() {
  const syncing = useSelector(
    (state: RootState) => state.wallet_state.status.syncing,
  );
  const synced = useSelector(
    (state: RootState) => state.wallet_state.status.synced,
  );

  const height = useSelector(
    (state: RootState) => state.wallet_state.status.height,
  );
  const connectionCount = useSelector(
    (state: RootState) => state.wallet_state.status.connection_count,
  );

  return (
    <div style={{ margin: 16 }}>
      <Typography variant="subtitle1">
        <Trans>Status</Trans>
      </Typography>
      <div style={{ marginLeft: 8 }}>
        <Box display="flex">
          <Box flexGrow={1}>
            <Trans>status:</Trans>
          </Box>
          <Box>
            {(() => {
              if (syncing) return <Trans>syncing</Trans>;
              if (synced) return <Trans>synced</Trans>;
              if (!synced) return <Trans>not synced</Trans>;
            })()}
          </Box>
        </Box>
        <Box display="flex">
          <Box flexGrow={1}>
            <Trans>height:</Trans>
          </Box>
          <Box>
            <FormatLargeNumber value={height} />
          </Box>
        </Box>
        <Box display="flex">
          <Box flexGrow={1}>
            <Trans>connections:</Trans>
          </Box>
          <Box>
            <FormatLargeNumber value={connectionCount} />
          </Box>
        </Box>
      </div>
    </div>
  );
}

export default function HODLWallet() {
  const history = useHistory();
  const { walletId } = useParams();
  const { path } = useRouteMatch();
  const wallets = useSelector((state: RootState) => state.wallet_state.wallets);
  const loading = !wallets;

  // redirect to default "standard wallet"
  useEffect(() => {
    history.push('/dashboard/wallets/1');
  }, [wallets, walletId]);

  return (
    <LayoutMain
      loading={loading}
      loadingTitle={<Trans>Loading list of wallets</Trans>}
      title={<Trans>Wallets</Trans>}
    >
      <StandardWallet wallet_id={1} showTitle />
    </LayoutMain>
  );
}
