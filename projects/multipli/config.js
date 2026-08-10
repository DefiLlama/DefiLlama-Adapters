'use strict'

const TOKENS = {
  ethereum: {
    USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    WBTC: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    rwaUSDi: '0xA39986F96B80d04e8d7AeAaF47175F47C23FD0f4',
  },
  bsc: {
    BTCB: '0x7130d2A12B9bCBfAe4f2634d864A1Ee1Ce3Ead9c',
    WBTC: '0x0555E30da8f98308EdB960aa94C0Db47230d2B9c',
    USDT: '0x55d398326f99059fF775485246999027B3197955',
    USDC: '0x8AC76a51cc950d9822D68b83Fe1Ad97B32Cd580d',
  },
  avax: {
    USDC: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
    BTCb: '0x152b9d0FdC40C096757F570A51E494bD4B943E50',
  },
  monad: {
    USDC: '0x754704Bc059F8C67012fEd69BC8A327a5aafb603',
    rwaUSDi: '0x650b616b46fF94000Eb115926aB8393B90788D76',
  },
}

const chains = {
  ethereum: {
    v2Vaults: [
      {
        id: 'ethereum-xUSDC-v2',
        address: '0x133229E0AdFf22c6F1AD287D199ea09d35E4427B',
        expectedAsset: TOKENS.ethereum.USDC,
      },
      {
        id: 'ethereum-xUSDT-v2',
        address: '0x3f453133ea14550B883805672B2871B0Ac295462',
        expectedAsset: TOKENS.ethereum.USDT,
      },
      {
        id: 'ethereum-xWBTC-v2',
        address: '0xeA1EF816ddfA86a8E9690423C88C1512c01d1799',
        expectedAsset: TOKENS.ethereum.WBTC,
      },
    ],
    v1: {
      enabled: true,
      disjointFromV2: true,
      allowedAssets: [
        TOKENS.ethereum.USDC,
        TOKENS.ethereum.USDT,
        TOKENS.ethereum.WBTC,
      ],
    },
    blockedAssets: [TOKENS.ethereum.rwaUSDi],
  },

  bsc: {
    v2Vaults: [
      {
        // Vault symbol is xWBTC; underlying is WBTC on BSC, not BTCB.
        id: 'bsc-xWBTC-v2',
        address: '0x41DbD2BaC7F0dd7A3F0De5329eCb57c9afE14C5C',
        expectedAsset: TOKENS.bsc.WBTC,
      },
      {
        id: 'bsc-xUSDT-v2',
        address: '0xdA0dF997CE0253e979a1E892a0468DBf45A3Dcb8',
        expectedAsset: TOKENS.bsc.USDT,
      },
      {
        id: 'bsc-xUSDC-v2',
        address: '0x468e0dAbd55772775A9cD4c39fB0d4586B8aEdAe',
        expectedAsset: TOKENS.bsc.USDC,
      },
    ],
    v1: {
      enabled: true,
      disjointFromV2: true,
      allowedAssets: [
        TOKENS.bsc.BTCB,
        TOKENS.bsc.WBTC,
        TOKENS.bsc.USDT,
        TOKENS.bsc.USDC,
      ],
    },
    blockedAssets: [],
  },

  avax: {
    v2Vaults: [
      {
        id: 'avax-xUSDC-v2',
        address: '0xCF0Eb4ac018C06a16ED5c63484823C7805e7599D',
        expectedAsset: TOKENS.avax.USDC,
      },
      {
        id: 'avax-xBTCb-v2',
        address: '0x468BbabAEf852C134b584382C0fef83F2954Cd5c',
        expectedAsset: TOKENS.avax.BTCb,
      },
    ],
    v1: { enabled: false, disjointFromV2: true, allowedAssets: [] },
    blockedAssets: [],
  },

  monad: {
    v2Vaults: [
      {
        id: 'monad-xUSDC-onchain-vault',
        address: '0xd74FB32112b1eF5b4C428Fead8dA8d85A0019009',
        expectedAsset: TOKENS.monad.USDC,
      },
    ],
    v1: { enabled: false, disjointFromV2: true, allowedAssets: [] },
    blockedAssets: [TOKENS.monad.rwaUSDi],
  },
}

module.exports = { chains, TOKENS }
