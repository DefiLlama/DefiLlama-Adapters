const { staking } = require("../helper/staking");
const { pool2 } = require("../helper/pool2");

const config = {
  bsc: { papr: '0x246475dF8703BE0C2bA2f8d0fb7248D95Cc1Ba26', lp: '0x88afbae882348011c80bd4f659962d32ffed4089', stakingC: '0xa00ba88adb75d8877e4f2035f3abe43b74f10a4b', pool2C: '0x28165e285cb40210f6b896bc937f7322f3a2bee2', },
  polygon: { papr: '0xFbe49330E7B9F58a822788F86c1be38Ab902Bab1', lp: '0xb1Cd060D7c7B8F338e13D6Aac11f484eE451c5b5', stakingC: '0xD524e0dE85b225A7ea29E989bF13a4deE5De1913', pool2C: '0xac2b5b9c4696dd96c97d3d8da6f6ff412020566d', },
  kcc: { papr: '0x9dEb450638266f787E6E29d0Fe811069f828CF56', stakingC: '0xa0A0727cA35B2Af606EceDD2f69d8884DE090538', },
  fantom: { papr: '0xC5e7A99A20941cBF56E0D4De608332cDB792e23e', stakingC: '0x982Df9B6e86838c7f0fB0d63eD84f98dcC110E29', },
  aurora: { papr: '0xa5C09De3aa1CDb5Cb190Be66c77E033Be1CA594A', stakingC: '0x008757aB3E3aDE24a402882d701f9B99F3809283', },
}

module.exports = {
};

Object.keys(config).forEach(chain => {
  const { papr, lp, stakingC, pool2C } = config[chain]
  module.exports[chain] = {
    tvl: () => ({}),
    staking: staking(stakingC, papr, chain),
  }
  if (lp && pool2C)
    module.exports[chain].pool2 = pool2(pool2C, lp, chain)
})