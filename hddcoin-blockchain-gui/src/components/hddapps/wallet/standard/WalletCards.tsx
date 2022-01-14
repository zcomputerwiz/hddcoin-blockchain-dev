import React from 'react';
import { Grid } from '@material-ui/core';
import HODLWalletCardTotalBalance from '../card/WalletCardTotalBalance';
import HODLWalletCardSpendableBalance from '../card/WalletCardSpendableBalance';
import HODLWalletCardPendingTotalBalance from '../card/WalletCardPendingTotalBalance';
import HODLWalletCardPendingBalance from '../card/WalletCardPendingBalance';
import HODLWalletCardPendingChange from '../card/WalletCardPendingChange';

type Props = {
  wallet_id: number;
};

export default function HODLWalletCards(props: Props) {
  const { wallet_id } = props;

  return (
    <div>
      <Grid spacing={3} alignItems="stretch" container>
        <Grid xs={12} md={4} item>
          <HODLWalletCardTotalBalance wallet_id={wallet_id} />
        </Grid>
        <Grid xs={12} md={8} item>
          <Grid spacing={3} alignItems="stretch" container>
            <Grid xs={12} sm={6} item>
              <HODLWalletCardSpendableBalance wallet_id={wallet_id} />
            </Grid>
            <Grid xs={12} sm={6} item>
              <HODLWalletCardPendingTotalBalance wallet_id={wallet_id} />
            </Grid>
            <Grid xs={12} sm={6} item>
              <HODLWalletCardPendingBalance wallet_id={wallet_id} />
            </Grid>
            <Grid xs={12} sm={6} item>
              <HODLWalletCardPendingChange wallet_id={wallet_id} />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
}
