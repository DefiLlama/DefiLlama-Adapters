// Each bridged asset on Arc (bCRCL, bGLD, bBTCB, bUSDT) is a 1:1 claim on a real asset held in a
// CustodyVault on the asset's origin chain, so TVL is counted where the reserves sit.
const CUSTODY = {
  robinhood: [
    // [ origin token, vault holding it ]
    ['0xdF0992E440dD0be65BD8439b609d6D4366bf1CB5', '0xed811A67C40B25D02A39492D91Aaab335b2cBD92'], // CRCL
    ['0xC9a981FEE1F9DEc688bb123ccDeCc63D0deBFC4e', '0x96F98bA395976B0a7d62088A597Cd8B71233A3fE'], // GLD
  ],
  bsc: [
    ['0x55d398326f99059fF775485246999027B3197955', '0x402c61C3620d915C5Cc4160dd059a5f199c96D23'], // USDT
    ['0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c', '0x2F8dD161539fF04FF63f2c1303e671732450a7e0'], // BTCB
  ],
}

module.exports = {
  methodology: 'Counts the assets held in the Ellipse CustodyVaults on their origin chains (CRCL and GLD on Robinhood Chain, USDT and BTCB on BSC), which back the 1:1 bridged tokens issued on Arc.',
}

Object.entries(CUSTODY).forEach(([chain, tokensAndOwners]) => {
  module.exports[chain] = { tvl: (api) => api.sumTokens({ tokensAndOwners }) }
})
