const { get } = require('../helper/http')

const WISE = '0x66a0f676479Cee1d7373f3DC2e2952778BfF5bd6'

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

async function staking(api) {
  if (api.chain !== 'ethereum') return

  const [totalStaked] = await api.call({
    target: WISE,
    abi: 'function globals() view returns (uint256 totalStaked, uint256, uint256, uint256, uint256, uint256)',
  })
  api.add(WISE, totalStaked)
}

async function pool2(api) {
  if (api.chain !== 'ethereum') return

  const { tvlLiquidity } = await get('https://data.wisetoken.com/wise/globals/tvl')
  api.addUSDValue(tvlLiquidity)
}

module.exports = {
  misrepresentedTokens: true,
  methodology: 'RWA TVL = totalSupply of wtnUSDC + wtnUSDT receipt tokens (1:1 with deposited stables). Principal is forwarded to World Mobile for AirNodes; vaults only hold claimable interest. Staking TVL = totalStaked from the globals() function on the WISE token contract. Liquidity TVL = tvlLiquidity from WISE\'s public globals/tvl API, representing WISE/ETH Uniswap liquidity.',
  ethereum: { tvl, staking, pool2 },
  arbitrum: { tvl },
  base: { tvl },
}
