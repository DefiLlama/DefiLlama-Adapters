const axios = require('axios');
const BigNumber = require('bignumber.js');
const { getPrices } = require('../helper/utils');

const tvl = async () => {
  const res = await axios.get('https://core.pine.loans/stats/global?ethereum=1&solana=mainnet');

  const ethPrice = await getPrices({
    0: {
      'ethereum': 'ethereum'
    }
  });
  
  return {
    "coingecko:ethereum": new BigNumber(res.data.totalValueLocked.amount).div(ethPrice.data.ethereum.usd)
  };
}

module.exports = {
  methodology: 'Non-custodial decentralized asset-backed lending protocol that allows borrowers to borrow fungible digital tokens from lenders using non-fungible tokens as collateral',
  ethereum: {
    tvl
  }
}