const vaults = {
  ethereum: {
    wtnUSDC: '0x7e1EFF4301defc24936470B30bd1c686D2a295dc',
    wtnUSDT: '0x7e1EBE1D25367C6D3bC0aA72A1f00fC5320a05d7',
    USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  },
  arbitrum: {
    wtnUSDC: '0x7e1EFF4301defc24936470B30bd1c686D2a295dc',
    wtnUSDT: '0x7e1EBE1D25367C6D3bC0aA72A1f00fC5320a05d7',
    USDC: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
    USDT: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
  },
  base: {
    wtnUSDC: '0x7e1EFF4301defc24936470B30bd1c686D2a295dc',
    wtnUSDT: '0x7e1EBE1D25367C6D3bC0aA72A1f00fC5320a05d7',
    USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    USDT: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2',
  },
}

async function tvl(api) {
  const chainVaults = vaults[api.chain]
  if (!chainVaults) return

  const supplies = await api.multiCall({
    abi: 'erc20:totalSupply',
    calls: [chainVaults.wtnUSDC, chainVaults.wtnUSDT]
  })

  api.add(chainVaults.USDC, supplies[0])
  api.add(chainVaults.USDT, supplies[1])
}

module.exports = {
  misrepresentedTokens: true,
  methodology: 'RWA TVL = totalSupply of wtnUSDC + wtnUSDT receipt tokens (1:1 with deposited stables). Principal is forwarded to World Mobile for AirNodes; vaults only hold claimable interest.',
  ethereum: { tvl },
  arbitrum: { tvl },
  base: { tvl },
}
