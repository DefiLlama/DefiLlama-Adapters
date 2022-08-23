const http = require("./http");
const queries = require("./queries");
const baseUrl = "https://api.smartlink.so/v1";

const endpoint = "graphql";
const api = http(baseUrl);

function formatDate(unixTimestamp) {
  const timestamp = unixTimestamp ? unixTimestamp * 1000 : Date.now()
  return new Date(timestamp).toISOString().slice(0, 10)
}

const getTotalStakingTvl = async () => {
  const response = await api.post(endpoint, {
    ...queries.getTotalStakingTvl(),
  });

  return response.aggregate.sum.total || 0;
};

const getDexTvl = async () => {
  const today = Math.floor(Date.now() / 1000);
  const start = today - 1 * 24 * 3600;  // from one day ago
  const todayStr = formatDate(today)
  let tvl = 0

  const poolsTvl = await api.post(endpoint, {
    ...queries.tvlPerPool(start, today),
  });

  poolsTvl.forEach(pool => {
    const todayTvl = pool.pairDayData.find(i => formatDate(i.timestamp) === todayStr)
    if (todayTvl)
      tvl += todayTvl.tvl
  })

  return tvl;
};

module.exports = {
  getTotalStakingTvl,
  getDexTvl,
};
