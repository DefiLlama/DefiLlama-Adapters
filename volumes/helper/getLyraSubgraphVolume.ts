import { Chain } from "@defillama/sdk/build/general";
import { BigNumber } from "ethers";
import { request, gql } from "graphql-request";
import { getBlock } from "../../projects/helper/getBlock"

const UNIT = BigNumber.from("1000000000000000000");
const ONE_DAY_IN_SECONDS = 60 * 60 * 24

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
        }
      }
    }
  `;

  const prevDailyVolumeQuery = gql`
      markets(block:{number: $blockNumber}) {
        latestVolumeAndFees {
          totalNotionalVolume
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
      const timestampPreviousDay = timestamp - ONE_DAY_IN_SECONDS

      const chainBlocksPreviousDay = (await getBlock(timestampPreviousDay, chain, {}))

      const previousDayVolume = await request(
        graphUrls[chain],
        graphQueryPreviousTotalVolume,
        { blockNumber: chainBlocksPreviousDay }
      ).catch((e) =>
        console.error(`Failed to get total volume on ${chain}: ${e.message}`)
      );

      const prevDayVolumeSum = previousDayVolume.markets.reduce((acc, obj) => {
        return (
          acc +
          BigNumber.from(obj.latestVolumeAndFees.totalNotionalVolume)
            .div(UNIT)
            .toNumber()
        );
      }, 0);

      const totalVolume = await request(
        graphUrls[chain],
        graphQueryTotalVolume
      ).catch((e) =>
        console.error(`Failed to get total volume on ${chain}: ${e.message}`)
      );

      const totalVolumeSum = totalVolume.markets.reduce((acc, obj) => {
        return (
          acc +
          BigNumber.from(obj.latestVolumeAndFees.totalNotionalVolume)
            .div(UNIT)
            .toNumber()
        );
      }, 0);

      return {
        timestamp,
        totalVolume: totalVolumeSum,
        dailyVolume: totalVolumeSum - prevDayVolumeSum,
      };
    };
  };
}

export { getChainVolume };
