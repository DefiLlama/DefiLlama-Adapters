const { staking } = require("../helper/staking")

const PAXE_TOKEN = "0xd2A3eec06719D5Ac66248003B5488E02165dd2fa"
const PAXE_FARMING_CONTRACT = '0xbA576f5ecbA5182a20f010089107dFb00502241f'
const RESTAKING_POOL = '0x269e1ceb128ccCD5684BbAFF9906D69eD1e9e9C8'

module.exports = {
  methodology: 'We count the TVL on the PAXE token in the farming contract and the restaking pool',
  bsc: {
    tvl: () => ({}),
    staking: staking([RESTAKING_POOL, PAXE_FARMING_CONTRACT], PAXE_TOKEN)
  }
}
