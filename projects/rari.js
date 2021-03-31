const fetch = require("node-fetch");

async function fetch() {
  const { tvl } = fetch("https://app.rari.capital/api/stats").then((res) =>
    res.json()
  );

  return parseFloat(tvl);
}

module.exports = {
  fetch,
};
