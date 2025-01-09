const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')

const ftContract = "0x53167401aeebFf5677C31E1DDA945628422D7Ed2"
const giftContract = "0xD42A821E584513e18cFB77e56Bf635C551dE5D63"

async function tvl(time, ethBlock, _b, {api}) {
  return sumTokens2({ tokens: [nullAddress], owners: [ftContract, giftContract], api })
}

module.exports = {
  methodology: `We count the MNT on the contracts`,
  mantle: {
    tvl
  }
}
