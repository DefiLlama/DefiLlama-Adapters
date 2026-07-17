const ADDRESSES = require('../helper/coreAssets.json')
const { getLogs2 } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/solana')
const { getObjects } = require("../helper/chain/sui");

const evm_config = {
  ethereum: [
    { kernelEventEmitter: '0x6984DC28Bf473160805AE0fd580bCcaB77f4bD7C', fromBlock: 22330649 },
    { kernelEventEmitter: '0xEFfC0fD0CaD5762c360Eb2158500a5537bb4637d', fromBlock: 22965694 }
  ],
  bsc: [
    { kernelEventEmitter: '0x6984DC28Bf473160805AE0fd580bCcaB77f4bD7C', fromBlock: 49126003 },
    { kernelEventEmitter: '0xcE9ecebAFE2174FFC9b662FE6cc4610574AB602C', fromBlock: 54773913 }
  ],
  base: [
    { kernelEventEmitter: '0x3dDe8E4b5120875B1359b283034F9606D0f2F9eC', fromBlock: 29522359 },
    { kernelEventEmitter: '0x9b69c72B68B7A7E765335831d6234F593f818e6B', fromBlock: 33144489 }
  ],
  arbitrum: [
    { kernelEventEmitter: '0x3dDe8E4b5120875B1359b283034F9606D0f2F9eC', fromBlock: 331057353 },
    { kernelEventEmitter: '0xf7b221F8a45a62539a53F20C8D3A5a1edDd1b510', fromBlock: 359940838 }
  ],
  hyperliquid: [
    { kernelEventEmitter: '0x5a428F12a55d6E0ABa77Eb5B340f2ff95dE01BF5', fromBlock: 4470476 },
    { kernelEventEmitter: '0x59964b3af53eb10C596B92B3d6aeAfC038B3Bd8d', fromBlock: 8976860 }
  ],
  plume_mainnet: [
    { kernelEventEmitter: '0x6984DC28Bf473160805AE0fd580bCcaB77f4bD7C', fromBlock: 4574846 },
    { kernelEventEmitter: '0x1F5C460A8BF18B12fb7218019a1693391A8251a7', fromBlock: 13309471 }
  ],
  mantle: [
    { kernelEventEmitter: '0xD76515844574A7c3f4521704098082371ACEEeB5', fromBlock: 80184784 },
    { kernelEventEmitter: '0x802bE72795617ACec443321504150951f85De652', fromBlock: 82474030 }
  ],
  "0g": [{ kernelEventEmitter: '0xFBD495862410c549f200Ce224Ad3D02a0bAe260D', fromBlock: 5961960 }],
  monad: [{ kernelEventEmitter: '0xFBD495862410c549f200Ce224Ad3D02a0bAe260D', fromBlock: 33372521 }],
  megaeth: [{ kernelEventEmitter: '0x613d5b5f248Ff95557A8855B7b69Cbde09955C43', fromBlock: 7999879 }],
  tempo: [{ kernelEventEmitter: '0x8f794F042831345DfA6bFD7FB72d25128AD6ee1b', fromBlock: 14656375 }],
}

// AMM v2 periphery pools. Registered via the v2 manager (not emitted by the v1
// PoolCreated emitters above), so they are listed statically; they expose the
// same balancesAvailable() interface. token0/token1 are the chain-local reserves.
const v2_evm_config = {
  ethereum: [
    { pool: '0x1E0C3acCfD4c9A1731d3A0Cdb6b8afBD0f0c219c', token0: '0xa753a7395cae905cd615da0b82a53e0560f250af', token1: ADDRESSES.ethereum.USDC }, // QQQx/USDC
    { pool: '0x00739d7b2ed5eD3B80d9e10ccBc2468ad1b9C2FD', token0: '0xc845b2894dBddd03858fd2D643B4eF725fE0849d', token1: ADDRESSES.ethereum.USDC }, // NVDAx/USDC
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
}

const svm_config = {
  eclipse: [
    'BvNLQCQKxq5A7AQUsMdUqRhwXwmnYy7bkpVU67QrakJ8', // tETH/WETH (WETH)
    '8VSpqv9eAtxew8hbGjN3bWoyHCog9gFEcW42URVNpTH', // tETH/WETH (tETH)

    'ECSRM9wkFyABH55vYGoR2kjSNm3tGEFp1cT3htBWmngd', // tUSD/USDC (USDC)
    '6uoWjgNs8h7VYNmdrdHmXjty8Y8GrMjTxGcmb3EuDoM8', // tUSD/USDC (tUSD)

  ],
  solana: [
    'Eicqj6he3DfacaYugVtxSC6AsddFubigqfYFR945X59w', // USDT/USDC (USDT)
    '4fjfqdJsDCR2Kenfpc3nGZvQMds3D4MgpVydwmTnU7Sv', // USDT/USDC (USDC)

    '6Fv84LR6nWFYeWRJAehHF3KXRi1RWQRQkGn3eLK3QMxb', // SOL/USDC (SOL)
    '8NGoaasGcpa8h1JjLY598UCrmxpqgpuWVJtm9F5k3sid', // SOL/USDC (USDC)

    'JBfR8XHYRF52WzTqyB14gkNVWtpPr9DUqzfuxASGLmby', // SKATE/USDC (SKATE)
    '8munm11k8XjmjkyXygXWoZadfJuweNiFztKmgNzxccWb', // SKATE/USDC (USDC)

    'Ah4xbiSfQvsutS8fQiHwGm3HKgphTjq1jAJx1qvmSMw7', // MONAD/USDC (MONAD)
    '4Bq1iWyKDajv1cuRqd9ExYvk9gCbnR1ejUb29jGMCUrf', // MONAD/USDC (USDC)

    'CXJFEq5QPEkCxFCaiVEFEQpAHCUBDV3nQUTKTzw3mq6F', // PLUME/USDC (PLUME)
    'ENJRMTjGZs1ChGSZxtD8n4KDu9pimDfbmtb5peh8cxCg', // PLUME/USDC (USDC)

    // AMM v2 pool vaults (pool-token PDAs)
    'BihGfVYmaT4KpiHiBLwH2ad9Q2ybYVHS2Bd3hQtzg486', // v2 USDC/USDT (USDC)
    '3DW4k4ims6dFB2cXBk5m1uAfh1zowuj9CzBbF4jm1FRh', // v2 USDC/USDT (USDT)
    'AB6BBRPRt8ZNSsAp4jmwd5BD3Z7uqjkbjXvWrBpsuA4L', // v2 QQQx/USDC (QQQx)
    'zpAgwiY7Rk2GZ3VHyAx3ZuCCDE8PhkyhPELJEPnV3Th', // v2 QQQx/USDC (USDC)
    'DsdoQzMUBHe2Q2w4zwSbWzcqMWvSms1XcfiepJKkDHUb', // v2 NVDAx/USDC (NVDAx)
    '7DmHWD8vbYgqSZoF1sVPJ9BtPzZrHtRBSoduC3Sz9XiK', // v2 NVDAx/USDC (USDC)
  ]
}

const sui_config = {
  sui: [
    '0xde93f10233e575043ae56f71e6a60605c85b9bfee5bb1c67bac37577c8cbc8be',//SUI/USDC
    '0x9cc884871f937a3ebde84ea0af052b886af392b8d4e77bf94b447a93721e00d9', // USDT/USDC
    '0xc014f7cb0a2604fb887d09165242828e6fe913f30d7ae2bea80199caed5ccbcb' // v2 USDC/USDT
  ]
}

const eventAbis = {
  pool_created: "event PoolCreated(address kernelPool, address pool, address token0, address token1, uint24 fee)",
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
  // v1: pools discovered from the kernel event emitters' PoolCreated logs
  for (const { kernelEventEmitter, fromBlock } of evm_config[api.chain]) {
    const logs = await getLogs2({ api, target: kernelEventEmitter, eventAbi: eventAbis.pool_created, fromBlock, onlyArgs: true })
    const balances = await api.multiCall({ calls: logs.map(([_, pool]) => ({ target: pool })), abi: abis.balances_available })
    logs.forEach(([_, __, token0, token1], i) => {
      const { amount0, amount1 } = balances[i]
      api.add(token0, amount0)
      api.add(token1, amount1)
    })
  }
  // v2: statically-listed periphery pools, same balancesAvailable() interface
  const v2Pools = v2_evm_config[api.chain] || []
  if (v2Pools.length) {
    const balances = await api.multiCall({ calls: v2Pools.map((p) => ({ target: p.pool })), abi: abis.balances_available })
    v2Pools.forEach((p, i) => {
      const { amount0, amount1 } = balances[i]
      api.add(p.token0, amount0)
      api.add(p.token1, amount1)
    })
  }
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
