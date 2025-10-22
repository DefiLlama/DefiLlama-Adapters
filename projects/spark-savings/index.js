const CONFIG = {
  ethereum: {
    susdc: '0xBc65ad17c5C0a2A4D159fa5a503f4992c7B545FE',
    sparkVaultUsdc: '0x28B3a8fb53B741A8Fd78c0fb9A6B2393d896a43d',
    sparkVaultUsdt: '0xe2e7a17dFf93280dec073C995595155283e3C372',
    sparkVaultEth: '0xfE6eb3b609a7C8352A241f7F3A21CEA4e9209B8f',
  },
  base: {
    susdc: '0x3128a0F7f0ea68E7B7c9B00AFa7E41045828e858',
  },
  arbitrum: {
    susdc: '0x940098b108fB7D0a7E374f6eDED7760787464609',
  },
  optimism: {
    susdc: '0xCF9326e24EBfFBEF22ce1050007A43A3c0B6DB55',
  },
  unichain: {
    susdc: '0x14d9143BEcC348920b68D123687045db49a016C6',
  },
  avax: {
    sparkVaultUsdc: '0x28B3a8fb53B741A8Fd78c0fb9A6B2393d896a43d'
  }
}

async function tvl(api) {
  const savings = Object.values(CONFIG[api.chain])
  const supplyCalls = savings.map((target) => ({
    target
  }))

  const totalSupplies = await api.multiCall({
    abi: 'erc20:totalSupply',
    calls: supplyCalls,
  })

  api.add(savings, totalSupplies)
}

module.exports = {
  start: '2025-03-03',
  ...Object.fromEntries(
    Object.keys(CONFIG).map((chain) => [
      chain,
      { tvl },
    ])
  ),
}