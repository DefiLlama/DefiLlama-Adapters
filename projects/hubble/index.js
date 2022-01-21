const axios = require("axios");
const HUBBLE_API = "https://api.hubbleprotocol.io";

const client = axios.create({
  baseURL: HUBBLE_API,
});

async function fetch() {
  const metrics = await client.get("/metrics");
  return metrics.data.totalValueLocked;
}

module.exports = {
  fetch,
};
