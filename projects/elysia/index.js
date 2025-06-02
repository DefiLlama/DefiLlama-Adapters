const { sumTokensExport } = require("../helper/unwrapLPs");

const abi = {
  loansValue: "uint256:loansValue",
  v1Asset: "address:getUnderlyingAsset",
  v2Asset: "address:asset",
}

const addresses = {
  elfi: "0x4da34f8264cb33a5c9f17081b9ef5ff6091116f4",
  el: "0x2781246fe707bb15cee3e5ea354e2154a2877b16",
  elStaking: "0x3F0c3E32bB166901AcD0Abc9452a3f0c5b8B2C9D",
  elfiStaking: [
    "0xb41bcd480fbd986331eeed516c52e447b50dacb4",
    "0xCD668B44C7Cf3B63722D5cE5F655De68dD8f2750",
    "0x24a7fb55e4ac2cb40944bc560423b496dfa8803f",
  ],
  bscElfi: "0x6C619006043EaB742355395690c7b42d3411E8c0",
  bscElfiStaking: [
    "0x73653254ED0F28D6E5A59191bbB38B06C899fBcA",
    "0x861c2221e4d73a97cd94e64c7287fd968cba03e4",
  ],
};


const config = {
  ethereum: {
    v1Pools: ['0x527c901e05228f54a9a63151a924a97622f9f173', '0x3fea4cc5a03e372ac9cded96bd07795ac9034d71', '0xe0bda8e3a27e889837ae37970fe97194453ee79c'],
    stakingConfig: {
      tokens: [addresses.el, addresses.elfi],
      owners: [addresses.elStaking, ...addresses.elfiStaking],
    },
  },
  bsc: {
    v1Pools: ['0x5bb4d02a0ba38fb8b916758f11d9b256967a1f7f'],
    v2Pools: ['0x924B375Ea2E8f1F2E686E53823748C7C29ad6466', '0xB21a2a097FFC25A4B1C9baA50da482eA84687dcE', '0x836B9a6EF1B6a813136fe91803285383Ba94956C', '0x5a0154B76E8afe0ef3AA28fD6b4eA863458dB9EB'],
    stakingConfig: {
      tokens: [addresses.bscElfi],
      owners: addresses.bscElfiStaking,
    },
  },
  klaytn: {
    v2Pools: ['0x60961ca3A40BE41ddDEf708bf51ef2F8e9760A3b', '0x7F97f905A8d6fe4C493D339F094232E3577b4DBd']
  }
}

Object.keys(config).forEach(chain => {
  const { v1Pools, v2Pools, stakingConfig } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      if (v1Pools) {
        const v1Assets = await api.multiCall({ abi: abi.v1Asset, calls: v1Pools })
        await api.sumTokens({ tokensAndOwners2: [v1Assets, v1Pools] })
      }

      if (v2Pools) {
        const v2Assets = await api.multiCall({ abi: abi.v2Asset, calls: v2Pools })
        await api.sumTokens({ tokensAndOwners2: [v2Assets, v2Pools] })
      }
      return api.getBalances()
    },
    borrowed: async (api) => {
      if (v1Pools) {
        const v1Assets = await api.multiCall({ abi: abi.v1Asset, calls: v1Pools })
        const bals = await api.multiCall({ abi: 'erc20:balanceOf', calls: v1Assets.map((v, i) => ({ target: v, params: v1Pools[i] })) })
        const supplies = await api.multiCall({ abi: 'uint256:totalSupply', calls: v1Pools })
        api.addTokens(v1Assets, supplies)
        api.addTokens(v1Assets, bals.map(i => i * -1))
      }

      if (v2Pools) {
        const v2Assets = await api.multiCall({ abi: abi.v2Asset, calls: v2Pools })
        const loansValues = await api.multiCall({ abi: abi.loansValue, calls: v2Pools })
        api.addTokens(v2Assets, loansValues)
      }
      return api.getBalances()
    },
  }

  if (stakingConfig) {
    module.exports[chain].staking = sumTokensExport(stakingConfig)
  }

})