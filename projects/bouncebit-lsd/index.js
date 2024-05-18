const sdk = require("@defillama/sdk");
const { sumTokens } = require('../helper/sumTokens')
const ADDRESSES = require('../helper/coreAssets.json')
const nullAddress = ADDRESSES.null

const BBTC = '0xF5e11df1ebCf78b6b6D26E04FF19cD786a1e81dC'

async function bouncebitLSDTvl(_timestamp, block) {
  const BBBalance = (await sdk.api.erc20.totalSupply({ 
    target: '0x22aAC17E571D6651880d057e310703fF4C7c3483', 
    block,
    chain: 'bouncebit'
   })
  ).output

  const BBTCBalance = (
    await sdk.api.erc20.balanceOf({
      target: BBTC,
      owner: "0x7F150c293c97172C75983BD8ac084c187107eA19",
      block,
      chain: 'bouncebit'
    })
  ).output;

  const balances = {
    [nullAddress]: BBBalance,
    [BBTC]: BBTCBalance,
  };

  await sumTokens({
    balances: balances,
    tokensAndOwners: [
      [nullAddress, '0x22aAC17E571D6651880d057e310703fF4C7c3483'],
      [BBTC, '0x7F150c293c97172C75983BD8ac084c187107eA19'],
    ],
    chain: 'bouncebit'
  });

  return balances;
}

module.exports = {
  bouncebit: {
    tvl: bouncebitLSDTvl
  }
};
