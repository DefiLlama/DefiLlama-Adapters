const { sumTokens } = require('./helper/unwrapLPs')

async function tvl(_, block) {
  return sumTokens({}, [
    ['0xff20817765cb7f73d4bde2e66e067e58d11095c2', '0x706D7F8B3445D8Dfc790C524E3990ef014e7C578'],
  ], block)
}

module.exports = {
  ethereum: { tvl }
}
