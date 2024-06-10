const { cachedGraphQuery } = require('../helper/cache')
const { sumTokens2 } = require("../helper/unwrapLPs");
const { staking } = require('../helper/staking.js');

const abi = require('./abi.json')

const API_URL = `https://api.snowapi.net/graphql`

const query = `
query {
  SnowglobeContracts {
    pair
    snowglobeAddress
  }
  DeprecatedContracts {
    kind
    pair
    contractAddresses
  }
  StablevaultContracts {
    swapAddress
  }
}
`;

const XSNOB_CONTRACT = '0x83952E7ab4aca74ca96217D6F8f7591BEaD6D64E';
const SNOB_TOKEN_CONTRACT = '0xc38f41a296a4493ff429f1238e030924a1542e50';

async function getStableVaultBalances(stablevaults, api) {
  const calls = stablevaults.map(i => [0, 1, 2, 3].map(num => ({ params: num, target: i.swapAddress }))).flat()
  const tokens = await api.multiCall({ abi: abi.getToken, calls: calls, withMetadata: true,
    permitFailure: true, })
  const toa = []
  tokens.forEach(i => {
    if (!i.output) return;
    toa.push([i.output, i.input.target])
  })
  return sumTokens2({ api, tokensAndOwners: toa })
}

async function getSnowglobeBalances(snowglobes, api) {
  const singleSidedPairs = snowglobes.map(globe => globe.snowglobeAddress).filter(i => i)
  const [tokens, tokenBalances] = await Promise.all([
    api.multiCall({
      calls: singleSidedPairs,
      abi: abi.token
    }),
    api.multiCall({
      calls: singleSidedPairs,
      abi: abi.balance
    })
  ])
  api.addTokens(tokens, tokenBalances)
}

async function tvl(api) {
  const data = await cachedGraphQuery('snowball', API_URL, query)
  const deprecatedSnowglobes = data.DeprecatedContracts.filter(contract => contract.kind === "Snowglobe").map(contract => ({ pair: contract.pair, snowglobeAddress: contract.contractAddresses[0] }));
  const deprecatedStablevaults = data.DeprecatedContracts.filter(contract => contract.kind === "Stablevault").map(contract => ({ swapAddress: contract.contractAddresses[2] }));

  await Promise.all([
    getStableVaultBalances(data.StablevaultContracts.concat(deprecatedStablevaults), api),
    getSnowglobeBalances(data.SnowglobeContracts.concat(deprecatedSnowglobes), api),
  ])
}

module.exports = {
  avax: {
    tvl,
    staking: staking(XSNOB_CONTRACT, SNOB_TOKEN_CONTRACT)
  }
} // node test.js projects/snowball/index.js
