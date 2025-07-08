const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')

const contract = "0xcf205808ed36593aa40a44f10c7f7c2f67d4a4d4"
const clubs = "0x201e95f275f39a5890c976dc8a3e1b4af114e635"

async function tvl(api) {
  return sumTokens2({ tokens: [
    nullAddress,
    "0x0bD4887f7D41B35CD75DFF9FfeE2856106f86670"
  ], owners: [
    contract,
    clubs
  ], api })
}

module.exports = {
  methodology: `We count the ETH on ${contract} and FRIEND on ${clubs}`,
  base: {
    tvl
  }
}