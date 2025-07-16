const { sumTokens2 } = require('../helper/unwrapLPs')

const TOKENS = ['0x0000000000000000000000000000000000000000']
const OWNERS = [
  '0xbEF63121a00916d88c4558F2a92f7d931C67115B'
]

async function tvl(api) {
  return await sumTokens2({ owner: OWNERS[0], tokens: TOKENS, api });
}

module.exports = {
  core: {
    tvl
  }
}
