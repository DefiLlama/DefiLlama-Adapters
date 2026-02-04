const config = {
  bsc: { factory: '0xd82c03bd0543b567c9cec7b822373be2b167f00f', POOLX: '0xbAeA9aBA1454DF334943951d51116aE342eAB255',lockedDealV2: '0x436CE2ce8d8d2Ccc062f6e92faF410DB4d397905',  },
  base: { factory: '0x7ff9315f538df7ec76ec4815249dd30519726460', blacklistedTokens: ['0x9832355bec09aca6679bb6ca1ab5250c01045de2'] },
  arbitrum: { factory: '0x9cfd8c7834be0dfe41f3fe68c29124066d5cd13b', lockedDealV2: '0x7Ff9315f538dF7eC76Ec4815249Dd30519726460',  },
  ethereum: { factory: '0x9ff1db30c66cd9d3311b4b22da49791610922b13', lockedDealV2: '0x285B4866257eF51FfBDD239c10dE5f9493413d8f', },
  manta: { factory: '0x7Ff9315f538dF7eC76Ec4815249Dd30519726460', },
  telos: { factory: '0x2Bb9cFF524C76eb2eA27bC6cDbB93447115D8dcC', },
  polygon: { factory: '0x06fd710fD167f1f08b61e457F41D6e7c7DD9AF3D',  lockedDealV2: '0x9D13B213852669077131f8A24A676f27ab0C2931', },
  coti: { factory: '0x7Ff9315f538dF7eC76Ec4815249Dd30519726460',  },
  avax: { factory: '0x9c8F78E0aeAB8190c9d1DF7BEd0B26c1EDcB8DE6', lockedDealV2: '0xb16bbdf683ffd6d92290f7610bb10f22f9c71e9e',  },
  unichain: { factory: '0x7Ff9315f538dF7eC76Ec4815249Dd30519726460',  },
  moonbeam: { factory: '0x2Bb9cFF524C76eb2eA27bC6cDbB93447115D8dcC',  },
}

Object.keys(config).forEach(chain => {
  const { factory, POOLX, blacklistedTokens = [], lockedDealV2, } = config[chain]
  module.exports[chain] = {
    tvl: () => ({}),
    vesting: async (api) => {
      if (POOLX) blacklistedTokens.push(POOLX)
      const tokens = await api.fetchList({ lengthAbi: 'totalVaults', itemAbi: 'vaultIdToTokenAddress', target: factory })
      const vaults = await api.fetchList({ lengthAbi: 'totalVaults', itemAbi: 'vaultIdToVault', target: factory })
      if (lockedDealV2) await api.sumTokens({ owner: lockedDealV2, tokens, blacklistedTokens, })
      return api.sumTokens({ tokensAndOwners2: [tokens, vaults], blacklistedTokens })
    }
  }
  if (POOLX) module.exports[chain].staking = async (api) => {
    const vaults = await api.fetchList({ lengthAbi: 'totalVaults', itemAbi: 'vaultIdToVault', target: factory })
    return api.sumTokens({ owners: vaults, tokens: [POOLX] })
  }
})