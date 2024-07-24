const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2, sumTokensExport } = require('../helper/unwrapLPs')

const config = {
  "querier": "0x1693273B443699bee277eCbc60e2C8027E91995d",
  "feeCalculator": "0x2259440579447D0625a5E28dfF3E743d207e8890",
  "clearinghouse": "0xAE1ec28d6225dCE2ff787dcb8CE11cF6D3AE064f",
  "clearinghouseLiq": "0xca007C51Fc14eEA88252Cc4FD71e91E44026F020",
  "endpoint": "0xbbEE07B3e8121227AfCFe1E2B82772246226128e",
  "spotEngine": "0x32d91Af2B17054D575A7bF1ACfa7615f41CCEfaB",
  "perpEngine": "0xb74C78cca0FADAFBeE52B2f48A67eE8c834b5fd1"
}

const mantleConfig = {
  "querier": "0x71b50Ce0E7f7B920c1BAee3BDE00F2c3F7470395",
  //"feeCalculator": "",
  "clearinghouse": "0x5bcfC8AD38Ee1da5F45d9795aCaDf57D37FEC172",
  "clearinghouseLiq": "0x4b62c8179F85E399ce24fB279d44803F17118Aa4",
  "endpoint": "0x526D7C7ea3677efF28CB5bA457f9d341F297Fd52",
  "spotEngine": "0xb64d2d606DC23D7a055B770e192631f5c8e1d9f8",
  "perpEngine": "0x38080ee5fb939d045A9e533dF355e85Ff4f7e13D"
}


module.exports = {
  arbitrum: {
    tvl: sumTokensExport({
      owners: [config.clearinghouse, config.endpoint],
      tokens: [ADDRESSES.arbitrum.WBTC, ADDRESSES.arbitrum.WETH, ADDRESSES.arbitrum.USDC, ADDRESSES.arbitrum.ARB, ADDRESSES.arbitrum.USDT, ADDRESSES.arbitrum.USDC_CIRCLE],
    })
  },
  mantle: {
    tvl: sumTokensExport({
      owners: [mantleConfig.clearinghouse, mantleConfig.endpoint],
      tokens: ["0xcDA86A272531e8640cD7F1a92c01839911B90bb0", ADDRESSES.mantle.USDC, ADDRESSES.mantle.WETH, ADDRESSES.mantle.WMNT],
    })
  }
}