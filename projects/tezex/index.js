const { sumTokens2 } = require('../helper/chain/tezos')

// TEZEX-owned pools from https://github.com/StableTechnologies/TEZEX/blob/trunk/V2/tezex/src/config/network/mainnet.json
// Sirius and external migration-source pools are excluded because they belong to other protocols.
const pools = [
  'KT1VqphtqcszFRi9gzhLTgMBopDw1xQ1UzBd', // XTZ / USDtz
  'KT1C9RPUSsF4pYuMWBCUM7UReuCqdivWqsMM', // XTZ / USDt
  'KT19FfCZgzcAuRxXxNRgAJ5i4pRtvBWFtGKH', // USDt / tzBTC
]

module.exports = {
  timetravel: false,
  start: '2025-12-18',
  methodology: 'Counts native XTZ and token balances held by TEZEX liquidity pool contracts on Tezos, including unclaimed fees held in the pools. Excludes Sirius and other third-party pools accessible through the TEZEX interface.',
  tezos: {
    tvl: () => sumTokens2({ owners: pools, includeTezos: true }),
  },
}
