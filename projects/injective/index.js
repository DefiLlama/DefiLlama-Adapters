const { sumTokens, getEndpoint } = require('../helper/chain/cosmos');
const { get } = require('../helper/http');
const { sumTokensExport } = require('../helper/unwrapLPs')
const sdk = require("@defillama/sdk");

async function getPeggyDenomsBalances() {
  const chain = 'injective'
  const balances = {};
  const supply = `${getEndpoint(chain)}/cosmos/bank/v1beta1/supply?pagination.limit=10000`;
  const response = await get(supply);
  const coins = response.supply.filter(coin => coin.denom.startsWith('peggy'));
  const denoms = coins.map(coin => coin.denom)

  for (const { denom, amount } of coins) {
    sdk.util.sumSingleBalance(balances, denom.replaceAll('/', ':'), amount);
  }

  return { balances, denoms };
}

async function tvl(api) {
  const chain = 'injective'
  const owners = []
  const { balances, denoms } = await getPeggyDenomsBalances()
  
  return sumTokens({ api, balances, chain, owners, tokens: denoms })
}

module.exports = {
  methodology: 'TVL accounts for all liquidity on the Injective chain, using the chain\'s bank module as the source.',
  ethereum: { tvl: sumTokensExport({ owner: '0xf955c57f9ea9dc8781965feae0b6a2ace2bad6f3', fetchCoValentTokens: true, blacklistedTokens: ['0xe28b3B32B6c345A34Ff64674606124Dd5Aceca30'], logCalls: true }) },
  injective: { tvl },
};
