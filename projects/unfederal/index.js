const sdk = require('@defillama/sdk');
const BigNumber = require('bignumber.js');
const axios = require('axios');
const apiUrl = 'https://lending-blockchain-api.unfederalreserve.com';

async function tvl(timestamp, block) {
  const url = `${apiUrl}/db/blocks/${block}/markets`;
  const markets = await axios.get(url);

  const balances = {};

  markets.data.map(item => {
    sdk.util.sumSingleBalance(
      balances,
      item.underlying_address,
      BigNumber(item.liquidity).times(10 ** Number(item.underlying_decimals || 18)).toFixed(0))
  });

  return balances;
}

module.exports = {
  ethereum: {
    tvl,
  },
  tvl
}
