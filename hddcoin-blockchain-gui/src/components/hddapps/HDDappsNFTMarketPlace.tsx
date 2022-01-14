import React from 'react';
import styled from 'styled-components';
import { Trans } from '@lingui/macro';
import { useHistory } from 'react-router-dom';
import { Flex } from '@hddcoin/core';
import { Button, Grid, Typography, Link } from '@material-ui/core';
import { CardHero } from '@hddcoin/core';
import { HDDapps as HDDappsIcon } from '@hddcoin/icons';

const StyledHDDappsIcon = styled(HDDappsIcon)`
  font-size: 4rem;
`;

export default function HDDappsNFTMarketPlace() {
  const history = useHistory();

  function hddAppsLearnMore() {
            window.open(
              "https://hddcoin.org/nft", "_blank");
        }

  return (
    <Grid container>
      <Grid xs={12} md={12} lg={12} item>
        <CardHero>
          <StyledHDDappsIcon color="primary" />
          <Typography variant="body1">
            <Trans>
              HDDcoin NFT Marketplace. 
              Buy and Sell non-fungible tokens. 
              HDDcoin is working on an NFT Marketplace.
              This will offer our community, artists and investors the opportunity to buy and sell unique 
              digital assets from art, audio/music, videos and other digital files, to entire virtual worlds, 
              while using the HDDcoin blockchain to record public proof of ownership.  
			  <Link
                target="_blank"
                href="https://hddcoin.org/nft"
              >
                Learn more
			 </Link>
            </Trans>
          </Typography>

		  <Flex gap={1}>
            <Button
              onClick={hddAppsLearnMore}
              variant="contained"
              color="primary"
              // fullWidth
            >
              <Trans>Visit NFT Marketplace</Trans>
            </Button>
		  </Flex>		  
		 	
        </CardHero>
      </Grid>
    </Grid>
  );
}
