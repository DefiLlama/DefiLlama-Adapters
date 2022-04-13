const http = require("./http");
const queries = require("./queries");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");

dayjs.extend(utc);

const baseUrl = "https://api.smartlink.so/v1";
const endpoint = "graphql";
const api = http(baseUrl);

const inheritLastData = (tvls) => {
  const dayjsToday = dayjs().minute(0);
  const today = dayjsToday.format("YYYY-MM-DD");

  if (!tvls.length) return [];

  const lastPoolData = tvls[0];
  const poolLastDay = dayjs(lastPoolData.timestamp * 1000).format("YYYY-MM-DD");
  const poolHasToday = poolLastDay === today;

  if (poolHasToday && lastPoolData.tvl) return tvls;
  if (poolHasToday && !lastPoolData.tvl) {
    tvls[0].tvl = tvls[1]?.tvl || 0;
    return tvls;
  }

  return [{ ...lastPoolData, timestamp: dayjsToday.unix() }, ...tvls];
};

const groupTvlsByTimestamp = (tvls) => {
  return tvls.reduce((acc, cur) => {
    const timestamp = dayjs(cur.timestamp * 1000)
      .startOf("day")
      .valueOf();

    if (!acc[timestamp]) {
      acc[timestamp] = {
        ...cur,
        timestamp,
      };
      return acc;
    }

    acc[timestamp] = {
      ...acc[timestamp],
      tvl: +acc[timestamp].tvl + +cur.tvl,
    };
    return acc;
  }, {});
};

const flatPoolsData = (poolsTvl) => {
  return poolsTvl
    .map((pool) => {
      const data = pool.pairDayData || pool.pairHourData || [];

      return inheritLastData(data);
    })
    .flat(Infinity);
};

const getTotalStakingTvl = async () => {
  try {
    const response = await api.post(endpoint, {
      ...queries.getTotalStakingTvl(),
    });

    return response.aggregate.sum.total;
  } catch (error) {
    return 0;
  }
};

const getFarmsTvl = async () => {
  const [farmsTvl, farmsV2Tvl] = await Promise.all([
    api.post(endpoint, {
      ...queries.getFarmsTvl(),
    }),
    api.post(endpoint, {
      ...queries.getFarmsV2Tvl(),
    }),
  ]);

  return [...farmsTvl, ...farmsV2Tvl].reduce((acc, cur) => {
    const liquidityPairs = cur.liquidity.pairs[0] || { reserve0: 0 };
    const lpXtz = (liquidityPairs.reserve0 * 2) / cur.liquidity.totalSupply;
    const tvlXtz = lpXtz * cur.totalStaked;

    return acc + tvlXtz;
  }, 0);
};

const getDexTvl = async () => {
  const start = dayjs().utc().subtract(1, "month").unix();
  const today = dayjs().utc().unix();

  const poolsTvl = await api.post(endpoint, {
    ...queries.tvlPerPool(start, today),
  });

  const dexTvl = groupTvlsByTimestamp(flatPoolsData(poolsTvl));

  const dexTvlSorted = Object.values(dexTvl).sort((a, b) => {
    if (a.timestamp === b.timestamp) return 0;
    return a.timestamp < b.timestamp ? -1 : 1;
  });

  return dexTvlSorted.length ? dexTvlSorted[dexTvlSorted.length - 1].tvl : 0;
};

module.exports = {
  getTotalStakingTvl,
  getFarmsTvl,
  getDexTvl,
};
