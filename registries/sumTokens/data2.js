const ADDRESSES = require('../../projects/helper/coreAssets.json')

// Additional sumTokens registry configs, split out of registries/sumTokens.js / data1.js to keep files manageable.
// Same config shape as the `configs` object in sumTokens.js.
module.exports = {
  "woofi": {
    "fantom": {
      "tvl": { "owner": "0x286ab107c5E9083dBed35A2B5fb0242538F4f9bf", "tokens": [ADDRESSES.fantom.WFTM, "0x74b23882a30290451A17c44f4F05243b6b58C76d", ADDRESSES.fantom.WBTC, "0x6626c47c00F1D87902fc13EECfaC3ed06D5E8D8a", "0x04068da6c83afcfa0e13ba15a6696662335d5b75", "0x049d68029688eabf473097a2fc38ef61633a3c7a"] },
      "staking": { "owners": ["0x2Fe5E5D341cFFa606a5d9DA1B6B646a381B0f7ec", "0x1416E1378682b5Ca53F76656549f7570ad0703d9"], "tokens": ["0x6626c47c00f1d87902fc13eecfac3ed06d5e8d8a"] }
    },
    "bsc": {
      "tvl": { "owner": "0x5520385bFcf07Ec87C4c53A7d8d65595Dff69FA4", "tokens": [ADDRESSES.bsc.WBNB, ADDRESSES.bsc.ETH, ADDRESSES.bsc.BTCB, "0x4691937a7508860F876c9c0a2a617E7d9E945D4B", ADDRESSES.bsc.USDT, ADDRESSES.bsc.BUSD, "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82"] },
      "staking": { "owners": ["0x2AEab1a338bCB1758f71BD5aF40637cEE2085076", "0xba91ffD8a2B9F68231eCA6aF51623B3433A89b13"], "tokens": ["0x4691937a7508860f876c9c0a2a617e7d9e945d4b"] }
    },
    "avax": {
      "tvl": { "owner": "0x5520385bFcf07Ec87C4c53A7d8d65595Dff69FA4", "tokens": [ADDRESSES.avax.WAVAX, ADDRESSES.avax.WETH_e, ADDRESSES.avax.BTC_b, "0xaBC9547B534519fF73921b1FBA6E672b5f58D083", ADDRESSES.avax.USDC, ADDRESSES.avax.USDt] },
      "staking": { "owners": ["0xcd1B9810872aeC66d450c761E93638FB9FE09DB0", "0x3Bd96847C40De8b0F20dA32568BD15462C1386E3"], "tokens": ["0xabc9547b534519ff73921b1fba6e672b5f58d083"] }
    },
    "polygon": {
      "tvl": { "owner": "0x5520385bFcf07Ec87C4c53A7d8d65595Dff69FA4", "tokens": [ADDRESSES.polygon.WMATIC_2, ADDRESSES.polygon.WETH_1, ADDRESSES.polygon.WBTC, "0x1B815d120B3eF02039Ee11dC2d33DE7aA4a8C603", ADDRESSES.polygon.USDC, ADDRESSES.polygon.USDC_CIRCLE, ADDRESSES.polygon.USDT] },
      "staking": { "owners": ["0x9BCf8b0B62F220f3900e2dc42dEB85C3f79b405B", "0xba91ffD8a2B9F68231eCA6aF51623B3433A89b13"], "tokens": ["0x1b815d120b3ef02039ee11dc2d33de7aa4a8c603"] }
    },
    "arbitrum": {
      "tvl": { "owner": "0x5520385bFcf07Ec87C4c53A7d8d65595Dff69FA4", "tokens": [ADDRESSES.arbitrum.WETH, ADDRESSES.arbitrum.WBTC, "0xcAFcD85D8ca7Ad1e1C6F82F651fA15E33AEfD07b", ADDRESSES.arbitrum.ARB, ADDRESSES.arbitrum.USDC, ADDRESSES.arbitrum.USDC_CIRCLE, ADDRESSES.arbitrum.USDT] },
      "staking": { "owners": ["0x9321785D257b3f0eF7Ff75436a87141C683DC99d", "0x2CFa72E7f58dc82B990529450Ffa83791db7d8e2"], "tokens": ["0xcafcd85d8ca7ad1e1c6f82f651fa15e33aefd07b"] }
    },
    "optimism": {
      "tvl": { "owner": "0x5520385bFcf07Ec87C4c53A7d8d65595Dff69FA4", "tokens": [ADDRESSES.optimism.WETH_1, ADDRESSES.optimism.WBTC, ADDRESSES.optimism.OP, ADDRESSES.optimism.USDC, ADDRESSES.optimism.USDC_CIRCLE, ADDRESSES.optimism.USDT, "0x871f2F2ff935FD1eD867842FF2a7bfD051A5E527"] },
      "staking": { "owners": ["0xba91ffD8a2B9F68231eCA6aF51623B3433A89b13"], "tokens": ["0x871f2f2ff935fd1ed867842ff2a7bfd051a5e527"] }
    },
    "ethereum": {
      "tvl": { "__empty": true },
      "staking": { "owners": ["0xba91ffD8a2B9F68231eCA6aF51623B3433A89b13"], "tokens": ["0x4691937a7508860F876c9c0a2a617E7d9E945D4B"] }
    },
    "era": {
      "tvl": { "owner": "0xE656d70bc3550e3EEE9dE7dC79367A44Fd13d975", "tokens": [ADDRESSES.era.WETH, ADDRESSES.era.ZK, ADDRESSES.era.USDC, "0x1d17CBcF0D6D143135aE902365D2E5e2A16538D4"] }
    },
    "polygon_zkevm": {
      "tvl": { "owner": "0xF5d215d9C84778F85746D15762DaF39B9E83a2d6", "tokens": [ADDRESSES.polygon_zkevm.WETH, ADDRESSES.polygon_zkevm.USDC] }
    },
    "linea": {
      "tvl": { "owner": "0x5520385bFcf07Ec87C4c53A7d8d65595Dff69FA4", "tokens": [ADDRESSES.linea.WETH, "0x3aAB2285ddcDdaD8edf438C1bAB47e1a9D05a9b4", ADDRESSES.linea.USDC, ADDRESSES.linea.USDT] }
    },
    "base": {
      "tvl": { "owner": "0x5520385bFcf07Ec87C4c53A7d8d65595Dff69FA4", "tokens": [ADDRESSES.base.WETH, ADDRESSES.ethereum.cbBTC, ADDRESSES.base.USDbC, ADDRESSES.base.USDC, ADDRESSES.base.USDT] }
    },
    "mantle": {
      "tvl": { "owner": "0x5520385bFcf07Ec87C4c53A7d8d65595Dff69FA4", "tokens": [ADDRESSES.mantle.WMNT, ADDRESSES.mantle.WETH, ADDRESSES.mantle.mETH, ADDRESSES.mantle.USDT, ADDRESSES.mantle.USDC, ADDRESSES.mantle.cmETH] }
    },
    "sonic": {
      "tvl": { "owner": "0x5520385bFcf07Ec87C4c53A7d8d65595Dff69FA4", "tokens": [ADDRESSES.sonic.wS, "0x50c42dEAcD8Fc9773493ED674b675bE577f2634b", ADDRESSES.sonic.USDC_e] }
    },
    "berachain": {
      "tvl": { "owner": "0x5520385bFcf07Ec87C4c53A7d8d65595Dff69FA4", "tokens": [ADDRESSES.berachain.WBERA, ADDRESSES.berachain.WBTC, ADDRESSES.berachain.WETH, ADDRESSES.berachain.USDC] }
    },
    "hyperliquid": {
      "tvl": { "owner": "0x5520385bFcf07Ec87C4c53A7d8d65595Dff69FA4", "tokens": [ADDRESSES.hyperliquid.WHYPE, "0xBe6727B535545C67d5cAa73dEa54865B92CF7907", "0x9FDBdA0A5e284c32744D2f17Ee5c74B284993463", ADDRESSES.hyperliquid.USDT0] }
    },
    "monad": {
      "tvl": { "owner": "0x5520385bFcf07Ec87C4c53A7d8d65595Dff69FA4", "tokens": [ADDRESSES.monad.WMON, ADDRESSES.monad.WETH, ADDRESSES.monad.USDC] }
    }
  },
}
