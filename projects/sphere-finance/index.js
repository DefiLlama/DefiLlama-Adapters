const { get } = require('../helper/http')

const sphere_token = "0x62f594339830b90ae4c084ae7d223ffafd9658a7"
const stakingAddress = "0x4Af613f297ab00361D516454E5E46bc895889653" // ylSPHERE

module.exports = {
  deadFrom: '2023-07-01',
  timetravel: false,
  misrepresentedTokens: true,
  polygon: {
    tvl: async () => {
      const data = await get('https://spheretvl.simsalacrypto.workers.dev/')
      return {
        tether: data.portfolio.net_worth_pools
      }
    },
  }
}
