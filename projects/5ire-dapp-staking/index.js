const STAKING_CONTRACT_V1 = "0xaa137EC3474ab407f3Be37b16576227dfE75Eb8D"
const STAKING_CONTRACT_V2 = "0x83D1B4277454EDAcF54A14fc586326386648A959"
const TOKEN_5IRE_ETH = "0x3bd7d4F524D09F4e331577247A048D56e4b67a7F"
const { stakings } = require("../helper/staking")


module.exports = {
  methodology: 'Total staked tokens in 5ire Dapp Staking',
  ethereum: {
    tvl: () => ({}),
    staking: stakings([STAKING_CONTRACT_V1, STAKING_CONTRACT_V2], TOKEN_5IRE_ETH),
  },
}



