const { sumTokens2 } = require('../helper/unwrapLPs')

const contract = "0xde6e08ac208088cc62812ba30608d852c6b0ecbc"

async function tvl(api) {
  return sumTokens2({ tokens: ["0xd4fa2d31b7968e448877f69a96de69f5de8cd23e"], owner: contract, api })
}

module.exports = {
  methodology: `We count the tokens on ${contract}`,
  ethereum: {
    tvl
  }
}
