const { queryContractStore, } = require('../helper/terra')
const BigNumber = require('bignumber.js')
const { toUSDTBalances } = require('../helper/balances')

const TERRA_MANAGER = 'terra1ajkmy2c0g84seh66apv9x6xt6kd3ag80jmcvtz'
const APERTURE_CONTRACT = 'terra1jvehz6d9gk3gl4tldrzd8qzj8zfkurfvtcg99x'

async function tvl() {
  let block
  let sumTvl = BigNumber(0)
  const { next_position_id } = await queryContractStore({
    contract: TERRA_MANAGER,
    queryParam: { get_next_position_id: {}, },
    block
  })
  const positions = [...Array(+next_position_id).keys()]
    .map((_value, position) => ({ chain_id: 3, position_id: `${position}` }))

  const chunkSize = 50
  for (let i = 0; i < positions.length; i += chunkSize) {
    await Promise.all(positions.slice(i, i + chunkSize)
      .map(async position => {
        const {
          items: [{
            info: {
              position_close_info,
              detailed_info,
            }
          }]
        } = await queryContractStore({
          contract: APERTURE_CONTRACT,
          queryParam: getQuery(position),
          block
        })

        if (!position_close_info)  // position is closed no need to add it to tvl
          sumTvl = sumTvl.plus(BigNumber(detailed_info.uusd_value))
      }))
  }

  return {
    'terrausd': sumTvl.dividedBy(BigNumber(1e6)),
  }

  function getQuery(postion) {
    return { batch_get_position_info: { positions: [postion], } }
  }
}

module.exports = {
  timetravel: false,
  terra: {
    tvl,
  }
}