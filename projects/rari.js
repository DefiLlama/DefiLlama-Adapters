const fetchUrl = require("node-fetch");

async function fetch() {
  const { tvl } = await fetchUrl("https://app.rari.capital/api/stats").then(
    (res) => res.json()
  );

  return parseFloat(tvl);
}

module.exports = {
  fetch,
};
