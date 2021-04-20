const sdk = require("@defillama/sdk");

const wSCRT = '0x2b89bf8ba858cd2fcee1fada378d5cd6936968be'

async function tvl(timestamp, block) {
  const wscrtSupply = await sdk.api.erc20.totalSupply({
    target: wSCRT,
    block
  })
  return {
    [wSCRT]: wscrtSupply.output
  }
}

module.exports = {
  name: 'Secret Network Bridge',
  token: 'WSCRT',
  category: 'Assets',
  start: 0, // WRONG!
  tvl
}