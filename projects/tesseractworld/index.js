const utils = require('../helper/utils');

async function fetchTvl() {
  const url = 'https://endurance-subgraph.fusionist.io/subgraphs/name/tesseract/exchange-v3'
  const data = {
    query: `
      query GetLatestPancakeDayData {
        pancakeDayDatas(first: 1, orderBy: date, orderDirection: desc) {
          tvlUSD
        }
      }
    `,
    operationName: "pancakeDayDatas"
  };
  const res = await utils.postURL(url, data)
  if (res.data.data.pancakeDayDatas.length > 0) {
    return parseFloat(res.data.data.pancakeDayDatas[0].tvlUSD)
  }
  return 0
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  endurance:{
    fetch: fetchTvl
  },
  fetch: fetchTvl
}