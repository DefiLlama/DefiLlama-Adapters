const { queryContractStore } = require('../helper/chain/terra')
const { log } = require('../helper/utils')

const TERRA_MANAGER = 'terra1ajkmy2c0g84seh66apv9x6xt6kd3ag80jmcvtz'
const APERTURE_CONTRACT = 'terra1jvehz6d9gk3gl4tldrzd8qzj8zfkurfvtcg99x'
let openPositions = require('./openPositions.json')

const currentQueriedCount = 11190

async function terra_tvl() {
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
  }

  log('Final UST sum: %s', sumTvl)

  return {
    'terrausd': sumTvl / 1e6,
  }

  function getQuery(postion) {
    return { batch_get_position_info: { positions: [postion], } }
  }
}

const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { default: BigNumber } = require('bignumber.js')

const ORACLE = "0x5196e0a4fb2A459856e1D41Ab4975316BbdF19F8";
const USDC_TOKEN_ADDRESS = "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E";
const vaultLibAddr = "0x16Ab749236B326905be4195Fe01CBB260d944a1d";
const vaultContracts = [
  "0x39471BEe1bBe79F3BFA774b6832D6a530edDaC6B", // Vault 0
  "0xFC7D93c51f1BCa3CEEbF71f30B4af3bf209115A0", // Vault 1
  "0x12D89E117141F061274692Ed43B774905433706A", // Vault 2
];

async function avax_tvl(timestamp, _, { avax: block }) {
  const chain = 'avax'
  const calls = vaultContracts.map(i => ({ target: i }))
  const equityETHValues = (
    await sdk.api.abi.multiCall({
      abi: abi.getEquityETHValue,
      calls, chain, block,
    })
  ).output;

  const vaultLeverage = (
    await sdk.api.abi.multiCall({
      abi: abi.getLeverage,
      calls, chain, block,
    })
  ).output;

  let balances = {};
  for (let i = 0; i < vaultContracts.length; i++) {
    const bal = vaultLeverage[i].output * equityETHValues[i].output / 1e22
    sdk.util.sumSingleBalance(balances, `coingecko:avalanche-2`, BigNumber(bal).toFixed(0));
  }

  return balances;
}

module.exports = {
  timetravel: false,
  avax: {
    tvl: avax_tvl,
  },
  terra: {
    tvl: terra_tvl,
  },
  hallmarks: [
    [1651881600, "UST depeg"],
  ]
}
