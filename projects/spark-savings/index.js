const CONFIG = {
  ethereum: {
    susdc: '0xBc65ad17c5C0a2A4D159fa5a503f4992c7B545FE',
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
}

async function tvl(api) {
  const savings = CONFIG[api.chain]

  const response = await api.call({
    abi: 'erc20:totalSupply',
    target: savings.susdc,
  })
  api.add(savings.susdc, response)
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