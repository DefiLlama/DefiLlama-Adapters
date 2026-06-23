const { staking } = require('../helper/staking')


const TOKEN = "0x3e62fED35c97145e6B445704B8CE74B2544776A9"
const STAKING_CONTRACT = "0xA9F4ee72439afC704db48dc049CbFb7E914aD300"

module.exports = {
  arbitrum: {
    tvl: () => ({}),
    staking: staking(
      STAKING_CONTRACT,
      TOKEN,
    ),
  },
}
