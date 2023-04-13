const sdk = require('@defillama/sdk')

async function tvl(ts, block) {
  return {
    'bitcoin': (await sdk.api.erc20.totalSupply({ target: '0xe1406825186D63980fd6e2eC61888f7B91C4bAe4', block })).output / 1e18
  }
}

module.exports = {
  ethereum: { tvl },
}
