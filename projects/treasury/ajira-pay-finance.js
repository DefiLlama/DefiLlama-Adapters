const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");
const AJP = "0x9DBC0Ad09184226313FbDe094E7c3DD75c94f997"

const arb_tokens = [
    ADDRESSES.arbitrum.USDC, ADDRESSES.arbitrum.WETH,
    ADDRESSES.arbitrum.WBTC, ADDRESSES.arbitrum.USDT, 
    ADDRESSES.optimism.DAI, '0x9DBC0Ad09184226313FbDe094E7c3DD75c94f997',
    '0x912CE59144191C1204E64559FE8253a0e49E6548',
    nullAddress
]

const bsc_tokens = [
    ADDRESSES.bsc.USDT, ADDRESSES.bsc.WBNB, 
    ADDRESSES.bsc.BUSD, ADDRESSES.bsc.USDC,
    '0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD', '0x9DBC0Ad09184226313FbDe094E7c3DD75c94f997',
    nullAddress
]

const polygon_tokens = [
    ADDRESSES.polygon.USDT, ADDRESSES.polygon.USDC,
    ADDRESSES.polygon.WETH_1, ADDRESSES.polygon.WBTC,
    ADDRESSES.polygon.WMATIC_1, ADDRESSES.polygon.DAI,
    ADDRESSES.polygon.BUSD, '0x9DBC0Ad09184226313FbDe094E7c3DD75c94f997',
    nullAddress
]

const kava_tokens = [
    ADDRESSES.kava.WKAVA, ADDRESSES.telos.ETH,
    ADDRESSES.moonriver.USDT, ADDRESSES.kava.axlUSDC,
    '0x9DBC0Ad09184226313FbDe094E7c3DD75c94f997',
    nullAddress
]

const owners = {
    bsc: '0x12A65dFDD9E94Bd7f7547d1C4365c5c067f47ed0',
    arbitrum: '0x396B58574c0760E84E16468457c460bdCC6f8b57',
    polygon: '0xd7B2DEcAAcD75ADb92C1ee0C77e2303c815012d0',
    kava: '0xdBD5c57F3a0A6eFC7c9E91639D72Cc139c581AB4'
}

module.exports = treasuryExports({
    kava: {
        tokens: kava_tokens,
        owners: [owners.kava],
        ownTokens: [AJP]
    },
    bsc: {
      tokens: bsc_tokens,
      owners: [owners.bsc],
      ownTokens: [AJP],
    },
    polygon: {
        tokens: polygon_tokens,
        owners: [owners.polygon],
        ownTokens: [AJP]
    },
    arbitrum: {
        tokens: arb_tokens,
        owners: [owners.arbitrum],
        ownTokens: [AJP]
    }
  })