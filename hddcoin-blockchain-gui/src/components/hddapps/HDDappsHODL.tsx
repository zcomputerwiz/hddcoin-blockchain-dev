import React from 'react';
import styled from 'styled-components';
import { Trans } from '@lingui/macro';
import { useHistory } from 'react-router-dom';
import { Flex, Link, CardHero } from '@hddcoin/core';
import { Button, Grid, Typography, Divider } from '@material-ui/core';
import useOpenExternal from '../../hooks/useOpenExternal';
import { HDDappsHODLHero as HDDappsHODLHeroIcon } from '@hddcoin/icons';
import HODLWallet from './HDDappsHODLWallet';

const StyledHDDappsIcon = styled(HDDappsHODLHeroIcon)`
  font-size: 4rem;
`;

export default function HDDappsHODL() {
  const history = useHistory();
  const openExternal = useOpenExternal();

  function hddAppsURLbuttonClickHODL() {
            openExternal('https://hddcoin.org/hodl');
        }
  
  //  function hddAppsOpenHODLTerminal() {
  //    history.push('/dashboard/hodlterminal/HODLterminal');
  //    history.push('/dashboard/hddapps/hodlterminal');
  //  }
  
    function hddAppsOpenHODLWallet() {
      history.push('/dashboard/hodlwallet');
  }
  
  return (
    <Grid container>
	  <Grid xs={12} md={12} lg={12} item>
        <CardHero>		  
		  <StyledHDDappsIcon color="primary" />		
          <Typography variant="h5">
            <Trans>
              HDDcoin HODL Program
            </Trans>
          </Typography>	
		  <Divider />		  
		  <Typography variant="body1">		
			<Trans>
			  {'HDDcoin HODL offers coin holders the opportunity to earn rewards on HDD locked in a contract for specific durations. Contracts are secured and managed 100% on-chain using a Smart Coin coded in CLVM (the on-chain programming language used by HDDcoin). '}
			  <Link
                target="_blank"
                href="https://hddcoin.org/hodl/"
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
              onClick={hddAppsURLbuttonClickHODL}
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
