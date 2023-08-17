const ADDRESSES = require('../helper/coreAssets.json')

const vaults = [
    {
        name: "usdc-eth",
        address: "0xF82aeDC7faA3Fe1F412C71fe5E432690C46cd1bb", 
        token1: ADDRESSES.ethereum.USDC,
        token2: ADDRESSES.ethereum.WETH,
        token1decimal: 6,
        token2decimal: 18,
        token1Name: "usd-coin",
        token2Name: "ethereum",
        chain: "ethereum"
    },
    {
        name: "wbtc-eth",
        address: "0x3FeE1B1C829DB1250B0e6B8605741E944Ed3A41e", 
        token1: ADDRESSES.ethereum.WBTC,
        token2: ADDRESSES.ethereum.WETH,
        token1decimal: 8,
        token2decimal: 18,
        token1Name: "wrapped-bitcoin",
        token2Name: "ethereum",
        chain: 'ethereum'
    },
    {
        name: "eth-usdc",
        address: "0x7F6d25dE79559e548f0417aeB1953Ab6D3D85b14", 
        token1: ADDRESSES.arbitrum.WETH,
        token2: ADDRESSES.arbitrum.USDC,
        token1decimal: 18,
        token2decimal: 6,
        token1Name: "ethereum",
        token2Name: "usd-coin",
        chain: "arbitrum"
    },
    {
        name: "wbtc-eth",
        address: "0x849668517a74535EC5ECc09Fa9A22e0CEf91443E",
        token1: ADDRESSES.arbitrum.WBTC,
        token2: ADDRESSES.arbitrum.WETH,
        token1decimal: 8,
        token2decimal: 18,
        token1Name: "wrapped-bitcoin",
        token2Name: "ethereum",
        chain: "arbitrum"
    },
    {
        name: "matic-usdc",
        address: "0xB19e59b77E173363FB7Ce674f1279c76ee237c7A", 
        token1: ADDRESSES.polygon.WMATIC_2, 
        token2: ADDRESSES.polygon.USDC, 
        token1decimal: 18,
        token2decimal: 6,
        token1Name: "wmatic",
        token2Name: "usd-coin",
        chain: "polygon"
    },
    {
        name: "matic-weth",
        address: "0x249403E3163aAA88259e0e79A513E999EF8AbEc3", 
        token1: ADDRESSES.polygon.WMATIC_2, 
        token2: ADDRESSES.polygon.WETH_1, 
        token1decimal: 18,
        token2decimal: 18,
        token1Name: "wmatic",
        token2Name: "ethereum",
        chain: "polygon"
    },
]
  
module.exports = {
    vaults
  }