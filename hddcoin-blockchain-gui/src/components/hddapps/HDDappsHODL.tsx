import React from 'react';
import styled from 'styled-components';
import { Trans } from '@lingui/macro';
import { useHistory } from 'react-router-dom';
import { Flex } from '@hddcoin/core';
import { Button, Grid, Typography, Link } from '@material-ui/core';
import { CardHero } from '@hddcoin/core';
import { HDDapps as HDDappsIcon } from '@hddcoin/icons';
//import HODLterminal from '../hodlterminal/HODLterminal';
import HODLWallet from './HDDappsHODLWallet';

const StyledHDDappsIcon = styled(HDDappsIcon)`
  font-size: 4rem;
`;

export default function HDDappsHODL() {
  const history = useHistory();

  function hddAppsLearnMore() {
            window.open(
              "https://hddcoin.org/hodl", "_blank");
        }
  
//  function hddAppsOpenHODLTerminal() {
//    history.push('/dashboard/hodlterminal/HODLterminal');
//  }

  function hddAppsOpenHODLWallet() {
    history.push('/dashboard/hodlwallet');
  }
  
  return (
    <Grid container>
	  <Grid xs={12} md={12} lg={12} item>
        <CardHero>
          <StyledHDDappsIcon color="primary" />
          <Typography variant="body1">
            <Trans>
              HDDcoin HODL Program. 
              Lock in your coins and get rewards. 
              HDDcoin HODL offers Coin Holders the opportunity to earn rewards on HDD locked in a Contract for specific hold durations. 
              Contracts are secured and managed 100% on-chain using a Smart Coin Contract coded in CLVM (the on-chain programming language used by HDDcoin).  
			  <Link
                target="_blank"
                href="https://hddcoin.org/hodl"
              >
                Learn more
			 </Link>
            </Trans>
          </Typography>		  
		  
		  <Flex gap={1}>
            <Button
              onClick={hddAppsOpenHODLWallet}
              variant="contained"
              color="primary"
              fullWidth
            >
              <Trans>Open HODL Wallet</Trans>
            </Button>
  {/*
            <Button
              onClick={hddAppsOpenHODLTerminal}
              variant="contained"
              color="primary"
              fullWidth
            >
              <Trans>Open HODL Terminal</Trans>
            </Button>
  */}
            <Button
              onClick={hddAppsLearnMore}
              variant="outlined"
              color="primary"
              fullWidth
            >
              <Trans>Learn about HODL</Trans>
            </Button>
          </Flex>
		  
        </CardHero>
      </Grid>
    </Grid>
  );
}
