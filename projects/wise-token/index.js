const WISE_ETH_PAIR_ADDR = '0x21b8065d10f73EE2e260e5B47D3344d3Ced7596E';
const ZERO_ADDR = '0x0000000000000000000000000000000000000000';
const WETH_ADDR = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';

const vaults = {
  ethereum: {
    wtnUSDC: ['0x7e1EFF4301defc24936470B30bd1c686D2a295dc', '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'],
    wtnUSDT: ['0x7e1EBE1D25367C6D3bC0aA72A1f00fC5320a05d7', '0xdAC17F958D2ee523a2206206994597C13D831ec7'],
    wtnUSDG: ['0x7E1e77EDE1d3b67ee46d031FC7De9e1379856064', '0xe343167631d89B6Ffc58B88d6b7fB0228795491D'],
  },
  arbitrum: {
    wtnUSDC: ['0x7e1EFF4301defc24936470B30bd1c686D2a295dc', '0xaf88d065e77c8cC2239327C5EDb3A432268e5831'],
    wtnUSDT: ['0x7e1EBE1D25367C6D3bC0aA72A1f00fC5320a05d7', '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9'],
    wtnUSDG: ['0x7E1e77EDE1d3b67ee46d031FC7De9e1379856064', '0x004B506865409877C9fA29bfb1ebA929984B9bbC'],
  },
  base: {
    wtnUSDC: ['0x7e1EFF4301defc24936470B30bd1c686D2a295dc', '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'],
    wtnUSDT: ['0x7e1EBE1D25367C6D3bC0aA72A1f00fC5320a05d7', '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2'],
  },
  robinhood: {
    wtnUSDG: ['0x7E1e77EDE1d3b67ee46d031FC7De9e1379856064', '0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168'],
  },
}

async function vaultTvl(api) {
  const chainVaults = vaults[api.chain]
  if (!chainVaults) return

  const entries = Object.values(chainVaults)
  const supplies = await api.multiCall({
    abi: 'erc20:totalSupply',
    calls: entries.map(([receipt]) => receipt),
  })

  entries.forEach(([, underlying], i) => api.add(underlying, supplies[i]))
}

async function tvl(api) {
  await vaultTvl(api)

  if (api.chain !== 'ethereum') return

  const [unownedUniLP, totalUniLP, reserves] = await Promise.all([
    api.call({ target: WISE_ETH_PAIR_ADDR, abi: 'erc20:balanceOf', params: [ZERO_ADDR] }),
    api.call({ target: WISE_ETH_PAIR_ADDR, abi: 'erc20:totalSupply' }),
    api.call({ target: WISE_ETH_PAIR_ADDR, abi: 'function getReserves() view returns (uint112,uint112,uint32)' })
  ]);

  const ethResWise = BigInt(reserves[1]); // ETH is token1
  const unowned = BigInt(unownedUniLP);
  const total = BigInt(totalUniLP);

  const uniswapOwnerlessEth = total === 0n ? 0n : (ethResWise * unowned) / total;

  api.add(WETH_ADDR, uniswapOwnerlessEth);
}

module.exports = {
  misrepresentedTokens: true,
  doublecounted: true,
  methodology: 'TVL = ownerless (burned LP) ETH in the WISE/ETH Uniswap LP (ethereum only), plus totalSupply of wtnUSDC/wtnUSDT/wtnUSDG vault receipt tokens per chain (1:1 with deposited stables).',
  ethereum: { tvl },
  arbitrum: { tvl: vaultTvl },
  base: { tvl: vaultTvl },
  robinhood: { tvl: vaultTvl },
};
