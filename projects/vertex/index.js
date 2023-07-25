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


module.exports = {
  arbitrum: {
    tvl: sumTokensExport({
      owners: [config.clearinghouse, config.endpoint],
      tokens: [ADDRESSES.arbitrum.WBTC, ADDRESSES.arbitrum.WETH, ADDRESSES.arbitrum.USDC, "0x912ce59144191c1204e64559fe8253a0e49e6548"],
    })
  }
}