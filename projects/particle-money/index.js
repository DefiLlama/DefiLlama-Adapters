const ADDRESSES = require('../helper/coreAssets.json')
const Abis = require("./abi.json");
const { sumTokensExport, sumUnknownTokens, } = require('../helper/unknownTokens')

const Contracts = {
  base: {
    weth: ADDRESSES.base.WETH,
    xeth: "0xC4655EB36aa7F1E476A3059A609443dEd02aB61F",
    particle: "0xaFe5451185513925F5E757F001425338Ff93412D",
    bank: "0xbd25055211498c703fD4Ea5404775FA37A8F4f9f",
    multiFeeDistribution: "0xcAB5FD12a21B471003b89D7B0354c57C2B686155",
    chef: "0x0B6d05af371610Fe4ca32c7cA468FC7d7e355b6d",
    lps: [
      "0x111D138D1A6C3dAe816678d03e2a17F3FdDF937E", // XETH_ETH_LP
      "0xCEC4795f5198b27d9E7087aEE518293676373F63", // PARTICLE_ETH_LP
    ],
  },
};

async function calcBaseStakingTvl(api) {
  const baseStakingData = await api.call({ target: Contracts.base.multiFeeDistribution, abi: Abis.multiFeeDistribution.totalSupply, });
  api.add(Contracts.base.particle, baseStakingData)
  return sumUnknownTokens({ api, useDefaultCoreAssets: true, lps: Contracts.base.lps, })
}

module.exports = {
  base: {
    tvl: 
      sumTokensExport({ 
        owner: Contracts.base.bank, 
        tokens: [Contracts.base.weth] 
      }),
    pool2: 
      sumTokensExport({ 
        owner: Contracts.base.chef, 
        tokens: Contracts.base.lps, 
        useDefaultCoreAssets: true, 
      }),
    staking: calcBaseStakingTvl,
  },
};