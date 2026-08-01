const abi = {
    "getActiveTokens": "address[]:getActiveTokens",
    "getInactiveTokens": "address[]:getInactiveTokens"
  };
const { sumTokens2 } = require('../helper/unwrapLPs');

const REGISTRY = '0xBbBe37FE58e9859b6943AC53bDf4d0827f7F0034';

async function tvl(api) {
  const activePools = await api.call({ target: REGISTRY, abi: abi['getActiveTokens'] });
  const inactivePools = await api.call({ target: REGISTRY, abi: abi['getInactiveTokens'] });
  const allPools = [...activePools, ...inactivePools];
  return sumTokens2({ owners: allPools, tokens: ['0xCA30c93B02514f86d5C86a6e375E3A330B435Fb5'], api })
}

module.exports = {
  methodology: 'Gets the active pools from the registry and adds the total supply of each pool',
  ethereum: { tvl, },
};
