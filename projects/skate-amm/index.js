const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/solana')
const { getObjects } = require("../helper/chain/sui");

// Skate AMM periphery pools (kernel on MegaETH). The v1 deployment was retired
// once its liquidity was fully withdrawn — every v1-only chain reported $0 TVL —
// so it is no longer tracked. token0/token1 are the chain-local reserves.
const evm_config = {
  ethereum: [
    { pool: '0x1E0C3acCfD4c9A1731d3A0Cdb6b8afBD0f0c219c', token0: '0xa753a7395cae905cd615da0b82a53e0560f250af', token1: ADDRESSES.ethereum.USDC }, // QQQx/USDC
    { pool: '0x00739d7b2ed5eD3B80d9e10ccBc2468ad1b9C2FD', token0: '0xc845b2894dBddd03858fd2D643B4eF725fE0849d', token1: ADDRESSES.ethereum.USDC }, // NVDAx/USDC
    { pool: '0x70B0B74b52De2948F2FE69f9788F17C9C4B917d8', token0: ADDRESSES.ethereum.WETH, token1: ADDRESSES.ethereum.USDG }, // WETH/USDG
    { pool: '0xA0B9cc50c460ddE28321C34fCD7161434655A38F', token0: '0x056B269Eb1f75477a8666ae8C7fE01b64dD55eCc', token1: ADDRESSES.ethereum.USDC }, // USD3/USDC
  ],
  arbitrum: [
    { pool: '0x0433CCB013a590eA4231aAC9ddf05bb753c14127', token0: ADDRESSES.arbitrum.USDC_CIRCLE, token1: ADDRESSES.arbitrum.USDT }, // USDC/USDT
    { pool: '0xcE61ABbf872C86e855D266D30251F741c1f24225', token0: ADDRESSES.arbitrum.WETH, token1: ADDRESSES.arbitrum.USDC_CIRCLE }, // WETH/USDC
    { pool: '0xfE696c7Cf1FFac9BeDf558C6e610bD978b08619F', token0: '0xa753a7395cae905cd615da0b82a53e0560f250af', token1: ADDRESSES.arbitrum.USDC_CIRCLE }, // QQQx/USDC
    { pool: '0xe1e76F6E987219802fC6bAA61040DA40eE0Be16E', token0: '0xc845b2894dBddd03858fd2D643B4eF725fE0849d', token1: ADDRESSES.arbitrum.USDC_CIRCLE }, // NVDAx/USDC
  ],
  bsc: [
    { pool: '0xf1418c3B237f44fB6A163f3a6e66D7A284154cCd', token0: ADDRESSES.bsc.USDC, token1: ADDRESSES.bsc.USDT }, // USDC/USDT (18-dec)
    { pool: '0x55dc9eDcEFb3D5c918f1E53668096D27F76e30c5', token0: '0xa753a7395cae905cd615da0b82a53e0560f250af', token1: ADDRESSES.bsc.USDC }, // QQQx/USDC
    { pool: '0x3493491b92C25c06d2E47EAE82Bd3251d313dD39', token0: '0xc845b2894dBddd03858fd2D643B4eF725fE0849d', token1: ADDRESSES.bsc.USDC }, // NVDAx/USDC
  ],
  base: [
    { pool: '0x2103EFCB4A3140F30c745e30Fb360816DC0Da415', token0: ADDRESSES.base.USDC, token1: ADDRESSES.base.USDT }, // USDC/USDT
    { pool: '0x8781383f9e35402Afb2a6a301d35EDf77954d3e1', token0: ADDRESSES.optimism.WETH_1, token1: ADDRESSES.base.USDC }, // WETH/USDC
  ],
  robinhood: [
    { pool: '0x84e35a36da4C0185fe6BB07940b1e58f66441B79', token0: ADDRESSES.robinhood.WETH, token1: ADDRESSES.robinhood.USDG }, // WETH/USDG
  ],
}

// Pool vaults (pool-token PDAs)
const svm_config = {
  solana: [
    'BihGfVYmaT4KpiHiBLwH2ad9Q2ybYVHS2Bd3hQtzg486', // USDC/USDT (USDC)
    '3DW4k4ims6dFB2cXBk5m1uAfh1zowuj9CzBbF4jm1FRh', // USDC/USDT (USDT)
    'AB6BBRPRt8ZNSsAp4jmwd5BD3Z7uqjkbjXvWrBpsuA4L', // QQQx/USDC (QQQx)
    'zpAgwiY7Rk2GZ3VHyAx3ZuCCDE8PhkyhPELJEPnV3Th', // QQQx/USDC (USDC)
    'DsdoQzMUBHe2Q2w4zwSbWzcqMWvSms1XcfiepJKkDHUb', // NVDAx/USDC (NVDAx)
    '7DmHWD8vbYgqSZoF1sVPJ9BtPzZrHtRBSoduC3Sz9XiK', // NVDAx/USDC (USDC)
    '2tALBRHF2SQMUTK599hYexLj45Zmj743sdZvqgQsD8dk', // WETH/USDG (WETH)
    '4RASDtxgEb7tJFP4yze2cjuzS8X2QfmWZsRgku5H9CHK', // WETH/USDG (USDG)
  ]
}

const sui_config = {
  sui: [
    '0xc014f7cb0a2604fb887d09165242828e6fe913f30d7ae2bea80199caed5ccbcb' // USDC/USDT
  ]
}

const abis = {
  balances_available: "function balancesAvailable() view returns (uint256 amount0, uint256 amount1)"
}

module.exports = {
  methodology: "Assets deployed on periphery chains. For EVM chains, we track the token balances in the pools. For SVM chains, we track the token balances owned by the pool addresses.",
  start: 1742169600, // '2025-03-17 GMT+0'
  timetravel: false,
}

const evmTvl = async (api) => {
  const pools = evm_config[api.chain]
  const balances = await api.multiCall({ calls: pools.map((p) => ({ target: p.pool })), abi: abis.balances_available })
  pools.forEach((p, i) => {
    const { amount0, amount1 } = balances[i]
    api.add(p.token0, amount0)
    api.add(p.token1, amount1)
  })
}

Object.keys(evm_config).forEach((chain) => {
  module.exports[chain] = { tvl: evmTvl }
})

const svmTvl = async (api) => {
  const pools = svm_config[api.chain]
  const res = await sumTokens2({ api, tokenAccounts: pools, computeTokenAccount: true })
  return res;
}

Object.keys(svm_config).forEach((chain) => {
  module.exports[chain] = { tvl: svmTvl }
})

const suiTvl = async (api) => {
  const pools = sui_config[api.chain]
  const objs = await getObjects(pools)
  objs.forEach((obj) => {
    const { fields: { pool_coin0_liquidity, pool_coin1_liquidity } } = obj
    const coin0Type = pool_coin0_liquidity.type.split('<')[1].replace('>', '')
    const coin1Type = pool_coin1_liquidity.type.split('<')[1].replace('>', '')
    const coin0Amount = pool_coin0_liquidity.fields.balance
    const coin1Amount = pool_coin1_liquidity.fields.balance
    api.add(coin0Type, coin0Amount)
    api.add(coin1Type, coin1Amount)
  })
}

Object.keys(sui_config).forEach((chain) => {
  module.exports[chain] = { tvl: suiTvl }
})

// export to preserve historical tvl
const retiredChains = ['hyperliquid', 'monad', 'eclipse', 'tempo', 'megaeth', 'mantle', 'plume_mainnet', '0g']

retiredChains.forEach((chain) => {
  module.exports[chain] = { tvl: async () => ({}) }
})
