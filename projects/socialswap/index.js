const utils = require("../helper/utils");

// There are staking and pool2 parts, but the Social Swap Token (SST) is not on coingecko yet. It'll be updated !!

async function fetch(timestamp, chainBlocks) {
  const tvl = await utils.fetchURL("https://backend.socialswap.io/api/v1/tlv");
  return tvl.data.total_usdt;
}

module.exports = {
  fetch,
};
