const { sumTokens } = require('../helper/unwrapLPs')
const tokens= require('./tokens')

async function tvl(_, block) {
  const wrapContract = '0x5Dc76fD132354be5567ad617fD1fE8fB79421D82'
  const toa = tokens.map(t => [t.ethereumContractAddress, wrapContract])
  return sumTokens({}, toa, block)
}

module.exports = {
  ethereum: {
    tvl
  }
};
