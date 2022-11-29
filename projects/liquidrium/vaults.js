
const vaults = [
    {
        name: "usdc-eth",
        address: "0xF82aeDC7faA3Fe1F412C71fe5E432690C46cd1bb", 
        token1: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        token2: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        token1decimal: 6,
        token2decimal: 18,
        token1Name: "usd-coin",
        token2Name: "ethereum",
        chain: "ethereum"
    },
    {
        name: "wbtc-eth",
        address: "0x3FeE1B1C829DB1250B0e6B8605741E944Ed3A41e", 
        token1: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
        token2: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        token1decimal: 8,
        token2decimal: 18,
        token1Name: "wrapped-bitcoin",
        token2Name: "ethereum",
        chain: 'ethereum'
    },
    {
        name: "eth-usdc",
        address: "0x7F6d25dE79559e548f0417aeB1953Ab6D3D85b14", 
        token1: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
        token2: "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8",
        token1decimal: 18,
        token2decimal: 6,
        token1Name: "ethereum",
        token2Name: "usd-coin",
        chain: "arbitrum"
    },
    {
        name: "wbtc-eth",
        address: "0x849668517a74535EC5ECc09Fa9A22e0CEf91443E",
        token1: "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f",
        token2: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
        token1decimal: 8,
        token2decimal: 18,
        token1Name: "wrapped-bitcoin",
        token2Name: "ethereum",
        chain: "arbitrum"
    },
    {
        name: "matic-usdc",
        address: "0xB19e59b77E173363FB7Ce674f1279c76ee237c7A", 
        token1: "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270", 
        token2: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174", 
        token1decimal: 18,
        token2decimal: 6,
        token1Name: "wmatic",
        token2Name: "usd-coin",
        chain: "polygon"
    },
    {
        name: "matic-weth",
        address: "0x249403E3163aAA88259e0e79A513E999EF8AbEc3", 
        token1: "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270", 
        token2: "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619", 
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