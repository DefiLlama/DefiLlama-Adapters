const sdk = require('@defillama/sdk')

async function tvl(ts, block) {
  return {
    '0x0316EB71485b0Ab14103307bf65a021042c6d380': (await sdk.api.erc20.totalSupply({ target: '0x0316EB71485b0Ab14103307bf65a021042c6d380', block })).output
  }
}

module.exports = {
  ethereum: { tvl }
}
