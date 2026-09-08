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
    { pool: '0xD1EcAA8791f3382B718691cDb79eD8B859300107', token0: '0x61DBbBb552dc893ab3aAd09F289f811E67cEf285', token1: ADDRESSES.ethereum.USDC }, // SKATE/USDC
    { pool: '0xF63e0aeD3643909a4228A69CE6ab4b4f446b83db', token0: '0x90a2a4c76b5d8c0bc892a69ea28aa775a8f2dd48', token1: ADDRESSES.ethereum.USDC }, // SPYx/USDC
    { pool: '0x5B9e93451f975d7FE04b81E57F28A0d9C16208f2', token0: '0x9d275685dc284c8eb1c79f6aba7a63dc75ec890a', token1: ADDRESSES.ethereum.USDC }, // AAPLx/USDC
  ],
  arbitrum: [
    { pool: '0x0433CCB013a590eA4231aAC9ddf05bb753c14127', token0: ADDRESSES.arbitrum.USDC_CIRCLE, token1: ADDRESSES.arbitrum.USDT }, // USDC/USDT
    { pool: '0xcE61ABbf872C86e855D266D30251F741c1f24225', token0: ADDRESSES.arbitrum.WETH, token1: ADDRESSES.arbitrum.USDC_CIRCLE }, // WETH/USDC
    { pool: '0xfE696c7Cf1FFac9BeDf558C6e610bD978b08619F', token0: '0xa753a7395cae905cd615da0b82a53e0560f250af', token1: ADDRESSES.arbitrum.USDC_CIRCLE }, // QQQx/USDC
    { pool: '0xe1e76F6E987219802fC6bAA61040DA40eE0Be16E', token0: '0xc845b2894dBddd03858fd2D643B4eF725fE0849d', token1: ADDRESSES.arbitrum.USDC_CIRCLE }, // NVDAx/USDC
    { pool: '0x2c7493D7bcC5e3DDeDfa6393eC868f59b90025f6', token0: '0x61DBbBb552dc893ab3aAd09F289f811E67cEf285', token1: ADDRESSES.arbitrum.USDC_CIRCLE }, // SKATE/USDC
  ],
  bsc: [
    { pool: '0xf1418c3B237f44fB6A163f3a6e66D7A284154cCd', token0: ADDRESSES.bsc.USDC, token1: ADDRESSES.bsc.USDT }, // USDC/USDT (18-dec)
    { pool: '0x55dc9eDcEFb3D5c918f1E53668096D27F76e30c5', token0: '0xa753a7395cae905cd615da0b82a53e0560f250af', token1: ADDRESSES.bsc.USDC }, // QQQx/USDC
    { pool: '0x3493491b92C25c06d2E47EAE82Bd3251d313dD39', token0: '0xc845b2894dBddd03858fd2D643B4eF725fE0849d', token1: ADDRESSES.bsc.USDC }, // NVDAx/USDC
    { pool: '0x13af6B20CBf88d33471CB9B51BA77250420d4836', token0: '0x61DBbBb552dc893ab3aAd09F289f811E67cEf285', token1: ADDRESSES.bsc.USDC }, // SKATE/USDC
    { pool: '0x4be18dCf641a55b91Be2e296397F293288E056Df', token0: '0x90a2a4c76b5d8c0bc892a69ea28aa775a8f2dd48', token1: ADDRESSES.bsc.USDC }, // SPYx/USDC
    { pool: '0x2A998c7742377e99642FAde7De32ac71D880549a', token0: '0x9d275685dc284c8eb1c79f6aba7a63dc75ec890a', token1: ADDRESSES.bsc.USDC }, // AAPLx/USDC
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
    'FYa6vgcJb9aGRiTBdTM6SnRJ5ugxXn2jmuzEyPG8ezsX', // SKATE/USDC (SKATE)
    '3F68wKDgYrMuKbiBq98SA1EAdQTwC2sp5UNtUgQvvJgL', // SKATE/USDC (USDC)
    'B6fPsYqN4Jj3kRHkfbsomnmKM5qB81nVRJcwoen1xxVU', // SPYx/USDC (SPYx)
    '8K9odKuPvcx27wfviS9fxkU1ChBmSWBz5igfbtXrRRMW', // SPYx/USDC (USDC)
    '33XkQ8Y6vS7nDYEboSN4qTCqPFJ93pJNSLZbhsNWBD5P', // AAPLx/USDC (AAPLx)
    '3kZuyJvDFjV2PZTmqvFswARtfsiYBWufMK4yQbREoafS', // AAPLx/USDC (USDC)
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
