const { queryContractStore, } = require('../helper/terra')
const { log, sleep, } = require('../helper/utils')
const { GraphQLClient } = require('graphql-request')

const TERRA_MANAGER = 'terra1ajkmy2c0g84seh66apv9x6xt6kd3ag80jmcvtz'
const APERTURE_CONTRACT = 'terra1jvehz6d9gk3gl4tldrzd8qzj8zfkurfvtcg99x'
const host = 'https://hive.terra.dev/graphql'
let openPositions = require('./openPositions.json')


// const posQuery = gql`{  wasm {    contractQuery(      contractAddress: "terra1ajkmy2c0g84seh66apv9x6xt6kd3ag80jmcvtz"      query: {get_next_position_id: {}}    )  }}`

const currentQueriedCount = 11190

async function tvl() {
  // await updatePositionsList()
  let sumTvl = 0
  const { next_position_id } = await queryContractStore({
    contract: TERRA_MANAGER,
    queryParam: { get_next_position_id: {}, },
  })
  for (let i = currentQueriedCount; i < +next_position_id; i++)
    openPositions.push(i)

  log(next_position_id, currentQueriedCount, openPositions.length)
  const positions = openPositions
    .map((_value) => ({ chain_id: 3, position_id: `${_value}` }))

  const chunkSize = 50
  for (let i = 0; i < positions.length; i += chunkSize) {
    log('fetching %s of %s', i, positions.length)
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
        })

        if (!position_close_info)  // position is closed no need to add it to tvl
          sumTvl += +detailed_info.uusd_value

      }))
    // await sleep(2000)
  }

  log('Final UST sum: %s', sumTvl)

  return {
    'terrausd': sumTvl / 1e6,
  }

  function getQuery(postion) {
    return { batch_get_position_info: { positions: [postion], } }
  }
}

async function updatePositionsList() {
  openPositions = []
  const { next_position_id } = await queryContractStore({
    contract: TERRA_MANAGER,
    queryParam: { get_next_position_id: {}, },
  })
  const positions = [...Array(+next_position_id).keys()]
    .map((_value, i) => ({ chain_id: 3, position_id: `${i}` }))

  const chunkSize = 50
  for (let i = 0; i < positions.length; i += chunkSize) {
    log('fetching %s of %s', i/chunkSize, Math.ceil(positions.length / chunkSize), openPositions.length)
    await Promise.all(positions.slice(i, i + chunkSize)
      .map(async position => {
        const {
          items: [{
            info: {
              position_close_info,
            }
          }]
        } = await queryContractStore({
          contract: APERTURE_CONTRACT,
          queryParam: getQuery(position),
        })

        if (!position_close_info)  // position is closed no need to add it to tvl
          openPositions.push(+position.position_id)
      }))

    require('fs').writeFileSync(__dirname + '/openPositions.json', JSON.stringify(openPositions.sort((a, b) => a - b)))
    // await sleep(2000)
  }

  // require('fs').writeFileSync(__dirname + '/openPositions.json', JSON.stringify(openPositions))

  function getQuery(postion) {
    return { batch_get_position_info: { positions: [postion], } }
  }
}

module.exports = {
  timetravel: false,
  terra: {
    tvl,
  },
  hallmarks:[
    [1651881600, "UST depeg"],
  ]
}
