module.exports = {
  getTotalFarmsTvl: () => ({
    query: `
        query total_farm_rewards_tvl {
          data: smartlinkDayDataAggregate {
            aggregate {
              sum {
                total: farmsTvl
              }
            }
          }
        }
      `,
  }),
  getFarmsTvl: () => ({
    query: `
      query farms_tvl {
        data: farm {
          address: id
          totalStaked: totalLpStake
          liquidity {
            totalSupply
            pairs {
              reserve0
            }
          }
        }
      }
  `,
  }),
  getFarmsV2Tvl: () => ({
    query: `
      query farms_v2_tvl {
        data: farmV2(where: {liquidity: {id: {_is_null: false}, pairs: {id: {_is_null: false}}}}) {
          address
          totalStaked: totalInputStake
          liquidity {
            totalSupply
            pairs {
              reserve0
            }
          }
        }
      }
  `,
  }),
  tvlPerPool: (start, end) => ({
    query: `
      query tvl_per_pool($start: bigint = "", $end: bigint = "") {
        data: pair {
          id
          pairDayData (order_by: {date: desc}, where: {date: {_gte: $start, _lte: $end}}) {
            tvl: reserveUsd
            timestamp: date
          }
        }
      }
    `,
    variables: { start, end },
  }),
  getTotalStakingTvl: () => ({
    query: `
        query total_staking_tvl {
          data: smartlinkDayDataAggregate {
            aggregate {
              sum {
                total: stakeTvl
              }
            }
          }
        }
      `,
  }),
};
