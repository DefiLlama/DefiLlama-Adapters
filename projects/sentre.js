const { get } = require('./helper/http')

async function fetch() {
  const response = (
        await get("https://stat.sentre.io/public/api/v1/tvl")
    )
  const tvl = response.tvl;
  return tvl;
}

module.exports = {
  timetravel: false,
  fetch,
};
