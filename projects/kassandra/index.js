const { postURL } = require('../helper/utils')

async function fetch() {
  const data = {
    operationName: "TotalValueLocked",
    variables: {},
    query: "query TotalValueLocked { factory (id: \"0x958c051B55a173e393af696EcB4C4FF3D6C13930\") { total_value_locked_usd } }"
  }
  const response = await postURL("https://graph.kassandra.finance/subgraphs/name/KassandraAvalanche", data);
  return response.data.data.factory.total_value_locked_usd
}

module.exports = {
  timetravel: false,
  fetch,
  avax: {
    fetch,
  }
}
