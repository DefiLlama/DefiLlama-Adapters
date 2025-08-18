const { sumTokens2 } = require('../helper/unwrapLPs');
const abis = require("./abis.json");

const DDDX = '0x4B6ee8188d6Df169E1071a7c96929640D61f144f';

async function staking(api) {
  const locked = await api.call({ abi: abis.locked, target: '0xFe9e21e78089094E1443169c4c74bBBBcBb13DE0', params: [8] })
  api.add(DDDX, locked.amount)
}

async function tvl(api) {
  const pairs = await api.fetchList({ lengthAbi: abis.allPairsLength, itemAbi: abis.allPairs, target: '0xb5737A06c330c22056C77a4205D16fFD1436c81b', })
  const bals = await api.multiCall({ abi: abis.totalBalances, calls: pairs, target: '0x89BEda6E5331CdDEe6c9a5Ad1B789ce6dFEBe6c7', })
  api.add(pairs, bals)
  return sumTokens2({ api, resolveLP: true })
}

module.exports = {
  doublecounted: true,
  bsc: {
    tvl,
    pool2: () => ({}),
    staking
  },
  deadFrom: '2022-07-11'
};
