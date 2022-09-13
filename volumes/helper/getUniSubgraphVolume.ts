import { Chain } from "@defillama/sdk/build/general";
import { request, gql } from "graphql-request";
import { getBlock } from "../../projects/helper/getBlock";
import { Adapter, ChainBlocks } from "../dexVolume.type";
import { SimpleVolumeAdapter } from "../dexVolume.type";
import { getStartTimestamp } from "./getStartTimestamp";

const getUniqStartOfTodayTimestamp = (date = new Date()) => {
  var date_utc = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds()
  );
  var startOfDay = new Date(date_utc);
  var timestamp = startOfDay.getTime() / 1000;
  return Math.floor(timestamp / 86400) * 86400;
};

// To get ID for daily data https://docs.uniswap.org/protocol/V2/reference/API/entities
const getUniswapDateId = (date?: Date) => getUniqStartOfTodayTimestamp(date) / 86400;

const DEFAULT_TOTAL_VOLUME_FACTORY = "uniswapFactories";
const DEFAULT_TOTAL_VOLUME_FIELD = "totalVolumeUSD";

const DEFAULT_DAILY_VOLUME_FACTORY = "uniswapDayData";
const DEFAULT_DAILY_VOLUME_FIELD = "dailyVolumeUSD";

interface IGetChainVolumeParams {
  graphUrls: {
    [chains: string]: string
  },
  totalVolume: {
    factory: string,
    field: string
  },
  dailyVolume?: {
    factory: string,
    field: string
  },
  customDailyVolume?: string,
  hasDailyVolume?: boolean
  hasTotalVolume?: boolean
  getCustomBlock?: (timestamp: number) => Promise<number>
}

function getChainVolume({
  graphUrls,
  totalVolume = {
    factory: DEFAULT_TOTAL_VOLUME_FACTORY,
    field: DEFAULT_TOTAL_VOLUME_FIELD,
  },
  dailyVolume = {
    factory: DEFAULT_DAILY_VOLUME_FACTORY,
    field: DEFAULT_DAILY_VOLUME_FIELD,
  },
  customDailyVolume = undefined,
  hasDailyVolume = true,
  hasTotalVolume = true,
  getCustomBlock = undefined,
}: IGetChainVolumeParams) {
  const totalVolumeQuery = gql`
  ${totalVolume.factory}(
    block: { number: $block }
    ) {
      ${totalVolume.field}
    }
    `;

  const dailyVolumeQuery =
    customDailyVolume ||
    gql`
    ${dailyVolume.factory} (id: $id) {
          ${dailyVolume.field}
      }`;

  const alternativeDaily = (timestamp: number) => gql`{
      uniswapDayDatas(where: {date: ${timestamp}}) {
          date
          dailyVolumeUSD
      }
  }`;

  const graphQueryTotalVolume = gql`${hasTotalVolume ? `query get_total_volume($block: Int) { ${totalVolumeQuery} }` : ""}`
  const graphQueryDailyVolume = gql`${hasDailyVolume ? `query get_daily_volume($id: Int) { ${dailyVolumeQuery} }` : ""}`;

  return (chain: Chain) => {
    return async (timestamp: number, chainBlocks: ChainBlocks) => {
      const block =
        getCustomBlock ?
          await getCustomBlock(timestamp) :
          await getBlock(timestamp, chain, chainBlocks);
      const id = getUniswapDateId(new Date(timestamp * 1000));
      const graphResTotal = hasTotalVolume ? await request(graphUrls[chain], graphQueryTotalVolume, { block }).catch(e => console.error(`Failed to get total volume on ${chain}: ${e.message}`)) : undefined;
      let graphResDaily = hasDailyVolume ? await request(graphUrls[chain], graphQueryDailyVolume, { id, block }).catch(e => console.error(`Failed to get daily volume on ${chain}: ${e.message}`)) : undefined;
      let dailyVolumeValue = graphResDaily ? graphResDaily[dailyVolume.factory]?.[dailyVolume.field] : undefined
      if (hasDailyVolume && !dailyVolumeValue) {
        graphResDaily = await request(graphUrls[chain], alternativeDaily(getUniqStartOfTodayTimestamp(new Date(timestamp * 1000)))).catch(e => console.error(`Failed to get daily volume via alternative query on ${chain}: ${e.message}`))
        dailyVolumeValue = graphResDaily ? graphResDaily['uniswapDayDatas']?.[0]?.dailyVolumeUSD : undefined
      }

      return {
        timestamp,
        block,
        totalVolume: graphResTotal ? graphResTotal[totalVolume.factory]?.[0]?.[totalVolume.field] : undefined,
        dailyVolume: dailyVolumeValue,
      };
    };
  };
}

function univ2Adapter(endpoints: {
  [chain:string]:string
}, {
  factoriesName = DEFAULT_TOTAL_VOLUME_FACTORY,
  dayData = DEFAULT_DAILY_VOLUME_FACTORY,
  totalVolume = DEFAULT_TOTAL_VOLUME_FIELD,
  dailyVolume = DEFAULT_DAILY_VOLUME_FIELD
}){
const graphs = getChainVolume({
  graphUrls: endpoints,
  totalVolume: {
    factory: factoriesName,
    field: totalVolume
  },
  dailyVolume: {
    factory: dayData,
    field: dailyVolume,
  },
});

const adapter: SimpleVolumeAdapter = {
  volume: Object.keys(endpoints).reduce((acc, chain) => {
    return {
      ...acc,
      [chain]: {
        fetch: graphs(chain as Chain),
        start: getStartTimestamp({
          endpoints: endpoints,
          chain,
          volumeField: dailyVolume,
          dailyDataField: dayData + "s"
        }),
      }
    }
  }, {} as Adapter)
};

return adapter;
}

export {
  getUniqStartOfTodayTimestamp,
  getChainVolume,
  univ2Adapter,
  DEFAULT_TOTAL_VOLUME_FACTORY,
  DEFAULT_TOTAL_VOLUME_FIELD,
  DEFAULT_DAILY_VOLUME_FACTORY,
  DEFAULT_DAILY_VOLUME_FIELD,
};
