const { request, gql } = require("graphql-request");
const { getBlock } = require("./getBlock");

// To get ID for daily data https://docs.uniswap.org/protocol/V2/reference/API/entities
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
  var timestamp = startOfDay / 1000;
  return Math.floor(timestamp / 86400);
};

const DEFAULT_TOTAL_VOLUME_FACTORY = "uniswapFactories";
const DEFAULT_TOTAL_VOLUME_FIELD = "totalVolumeUSD";

const DEFAULT_DAILY_VOLUME_FACTORY = "uniswapDayData";
const DEFAULT_DAILY_VOLUME_FIELD = "dailyVolumeUSD";

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
  customDailyVolume,
  hasDailyVolume = true,
  hasTotalVolume = true,
}) {
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
  ${dailyVolume.factory} (
    id: $id
  ) {
    ${dailyVolume.field}
  }
  `;

  const graphQuery = gql`
query get_tvl($block: Int, $id: Int) {
  ${hasTotalVolume ? totalVolumeQuery : ""}
  ${hasDailyVolume ? dailyVolumeQuery : ""}
}
`;
  return (chain) => {
    return async (timestamp, chainBlocks) => {
      const block = await getBlock(timestamp, chain, chainBlocks);
      const id = getUniqStartOfTodayTimestamp();
      const graphRes = await request(graphUrls[chain], graphQuery, {
        block,
        id,
      });

      return {
        totalVolume: Number(
          graphRes[totalVolume.factory][0][totalVolume.field]
        ),
        dailyVolume: hasDailyVolume
          ? Number(graphRes?.[dailyVolume.factory]?.[dailyVolume.field] || 0) ??
            undefined
          : undefined,
      };
    };
  };
}

module.exports = {
  getUniqStartOfTodayTimestamp,
  getChainVolume,
  DEFAULT_TOTAL_VOLUME_FACTORY,
  DEFAULT_TOTAL_VOLUME_FIELD,
  DEFAULT_DAILY_VOLUME_FACTORY,
  DEFAULT_DAILY_VOLUME_FIELD,
};
