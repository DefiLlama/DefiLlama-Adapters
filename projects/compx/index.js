const { get } = require("../helper/http");
async function tvl() {
  const tvl = await get(
    "https://compx-backend-e899c.ondigitalocean.app/get-compx-tvl"
  );
  return { tether: tvl.data.tvlUsd };
}

module.exports = {
  algorand: {
    tvl,
  },
};
