import { Chain } from "@defillama/sdk/build/general";
import { BigNumber } from "ethers";
import { request, gql } from "graphql-request";
import { getBlock } from "./getBlock"

const UNIT = BigNumber.from("1000000000000000000");
const ONE_DAY_IN_SECONDS = 60 * 60 * 24;

interface IGetChainVolumeParams {
  graphUrls: {
    [chains: string]: string;
  };
  timestamp: number;
}

function getChainVolume({ graphUrls, timestamp }: IGetChainVolumeParams) {
  const totalVolumeQuery = gql`
    {
      markets {
        latestVolumeAndFees {
          totalNotionalVolume
          totalPremiumVolume
        }
      }
    }
  `;

  const prevDailyVolumeQuery = gql`
      markets(block:{number: $blockNumber}) {
        latestVolumeAndFees {
          totalNotionalVolume
          totalPremiumVolume
        }
      }
    
  `;

  const graphQueryTotalVolume = gql`
    ${`query ${totalVolumeQuery} `}
  `;

  const graphQueryPreviousTotalVolume = gql`
    ${`query get_total_volume($blockNumber: Int) { ${prevDailyVolumeQuery} }`}
  `;

  return (chain: Chain) => {
    return async (timestamp: number) => {
      const timestampPreviousDay = timestamp - ONE_DAY_IN_SECONDS;

      const chainBlocksPreviousDay = await getBlock(
        timestampPreviousDay,
        chain,
        {}
      );

      const previousDayVolume = await request(
        graphUrls[chain],
        graphQueryPreviousTotalVolume,
        { blockNumber: chainBlocksPreviousDay }
      ).catch((e) =>
        console.error(`Failed to get total volume on ${chain}: ${e.message}`)
      );

      const prevDayVolumeSum = previousDayVolume.markets.reduce(
        (acc, obj) => {
          let vals = {
            notional:
              acc.notional +
              BigNumber.from(obj.latestVolumeAndFees.totalNotionalVolume)
                .div(UNIT)
                .toNumber(),
            premium:
              acc.premium +
              BigNumber.from(obj.latestVolumeAndFees.totalPremiumVolume)
                .div(UNIT)
                .toNumber(),
          };

          return vals;
        },
        { notional: 0, premium: 0 }
      );

      const totalVolume = await request(
        graphUrls[chain],
        graphQueryTotalVolume
      ).catch((e) =>
        console.error(`Failed to get total volume on ${chain}: ${e.message}`)
      );

      const totalVolumeSum = totalVolume.markets.reduce((acc, obj) => {
        let vals = {
          notional:
            acc.notional +
            BigNumber.from(obj.latestVolumeAndFees.totalNotionalVolume)
              .div(UNIT)
              .toNumber(),
          premium:
            acc.premium +
            BigNumber.from(obj.latestVolumeAndFees.totalPremiumVolume)
              .div(UNIT)
              .toNumber(),
        };

        return vals;
      }, { notional: 0, premium: 0 });

      return {
        timestamp,
        dailyVolume: totalVolumeSum.notional - prevDayVolumeSum.notional,
        totalVolume: totalVolumeSum.notional,
        totalPremiumVolume: totalVolumeSum.premium,
        totalNotionalVolume: totalVolumeSum.notional,
        dailyPremiumVolume: totalVolumeSum.premium - prevDayVolumeSum.premium,
        dailyNotionalVolume: totalVolumeSum.notional - prevDayVolumeSum.notional
      };
    };
  };
}

export { getChainVolume };
