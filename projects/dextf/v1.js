const { sumTokens2 } = require('../helper/unwrapLPs')
const { covalentGetTokens } = require('../helper/http')

const vaultAddress = "0x86C077092018077Df34FF44D5D7d3f9A2DF03bEf"

module.exports = async function tvl(timestamp, block) {
  const tokens = await covalentGetTokens(vaultAddress)
  return sumTokens2({ block, owner: vaultAddress, tokens,})
};
