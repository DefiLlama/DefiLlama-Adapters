const { staking } = require('../helper/staking')
const { get } = require('../helper/http')

const sphere_token = "0x62f594339830b90ae4c084ae7d223ffafd9658a7"
const stakingAddress = "0x284eba456e27ec9d07a656ce7cf68f2c78578f2e" // Sphere Games StakePrizePool

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  polygon: {
    tvl: async () => {
      const data = await get('https://spheretvl.simsalacrypto.workers.dev/')
      return {
        tether: data.portfolio.net_worth
      }
    },
    staking: staking(stakingAddress, sphere_token, 'polygon')
  }
}