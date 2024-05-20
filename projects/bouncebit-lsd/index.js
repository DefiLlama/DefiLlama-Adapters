const sdk = require("@defillama/sdk");
const ADDRESSES = require('../helper/coreAssets.json')
const { getFixBalancesSync } = require('../helper/portedTokens')
const BBTC = '0xF5e11df1ebCf78b6b6D26E04FF19cD786a1e81dC'

async function bouncebitLSDTvl(_timestamp, block, ...params) {  
  const balances = {}
  const BBBalance = (await sdk.api.erc20.totalSupply({ 
    target: '0x22aAC17E571D6651880d057e310703fF4C7c3483', 
    block,
    chain: 'bouncebit'
   })
  ).output

  sdk.util.sumSingleBalance(
    balances,
    ADDRESSES.null,
    BBBalance,
    'bouncebit'
  );

  const BBTCBalance = (
    await sdk.api.erc20.balanceOf({
      target: BBTC,
      owner: "0x7F150c293c97172C75983BD8ac084c187107eA19",
      block,
      chain: 'bouncebit'
    })
  ).output;

  sdk.util.sumSingleBalance(balances, BBTC, BBTCBalance, 'bouncebit');

  const fixBalances = getFixBalancesSync('bouncebit')

  fixBalances(balances)
  return balances;
}

module.exports = {
  bouncebit: {
    tvl: bouncebitLSDTvl
  }
};
