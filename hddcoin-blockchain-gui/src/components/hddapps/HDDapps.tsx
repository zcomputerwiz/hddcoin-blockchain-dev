import React from 'react';
import LayoutMain from '../layout/LayoutMain';
import { Trans } from '@lingui/macro';
import { Flex } from '@hddcoin/core';
import { Grid, Typography } from '@material-ui/core';
import HDDappsHODL from './HDDappsHODL';
import HDDappsOnlineStore from './HDDappsOnlineStore';
import HDDappsNFTMarketPlace from './HDDappsNFTMarketPlace';
import HDDappsExchangeTrading from './HDDappsExchangeTrading';

export default function HDDapps() {

  return (
  
    <LayoutMain title={<Trans>HDDcoin Applications</Trans>}>
		
		<>	
		<Flex flexDirection="column" gap={2} alignItems="center">
				
				<div>
				
				  <Grid container spacing={2} alignItems="stretch">
				  
					<Grid item xs={12} sm={6} md={6}>
					  <HDDappsHODL />
					</Grid>
					
					<Grid item xs={12} sm={6} md={6}>
					  <HDDappsOnlineStore />
					</Grid>
					
					<Grid item xs={12} sm={6} md={6}>
					  <HDDappsNFTMarketPlace />
					</Grid>
					
					<Grid item xs={12} sm={6} md={6}>
					  <HDDappsExchangeTrading />
					</Grid>
					
				  </Grid>
				  
				</div>
					
		</Flex>	     
		</> 
	 
    </LayoutMain>
  );
}
