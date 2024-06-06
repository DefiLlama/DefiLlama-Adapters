const ADDRESSES = require('./helper/coreAssets.json')
const sdk = require("@defillama/sdk")

const WETH = ADDRESSES.ethereum.WETH;
async function tvl(ts, block) {
  const balances = {}
  const { output: balance1 } = await sdk.api.eth.getBalance({ target: '0xFf40827Ee1c4Eb6052044101E1C6E28DBe1440e3', block })
  const { output: balance2 } = await sdk.api.eth.getBalance({ target: '0xA81f8460dE4008577e7e6a17708102392f9aD92D', block })
  sdk.util.sumSingleBalance(balances, WETH, balance1)
  sdk.util.sumSingleBalance(balances, WETH, balance2)
  return balances
}

module.exports = {
  deadFrom: 1648765747,
  ethereum: {
    tvl
  }
}
