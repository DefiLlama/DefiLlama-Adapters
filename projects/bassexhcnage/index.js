const { stakings } = require("../helper/staking");
const { sumTokens2 } = require('../helper/unwrapLPs')

const asssets = "0xb11f5E642EF4cF963e45A83E55A8fedCd58F9A9c"

const stakingContracts = [
  '0xa5895B5fF267041B968aA82d37A141F08f344333',
  '0xB6D7406F2e4B2680fFCCA3Ad3c3FAB5eE07f2832',
]
const bass = '0x1F23B787053802108fED5B67CF703f0778AEBaD8'

async function tvl(api) {
  const tokensAndOwners  = await api.call({
    target: asssets,
    abi: "function getAssets() view returns (address[][])",
  })
  return sumTokens2({ api, tokensAndOwners, })
}

module.exports = {
  hallmarks: [
    [1698969600,"Rug Pull"]
  ],
  base: {
    tvl,
    staking: stakings(stakingContracts, bass),
  },
};
