const sdk = require("@defillama/sdk");
const BigNumber = require("bignumber.js");

const USDT = "0x55d398326f99059fF775485246999027B3197955";

const publicPool = "0x6ACc136471c3796Db904FBD1329A32F6C11aD051";
const privatePool = "0xF7bf13b6e8A91970e2a18f46B256edF15485c121";
const pools = [publicPool, privatePool];

async function tvl(timestamp, block) {
  const lockedTokens = await sdk.api.abi.multiCall({
    abi: 'erc20:balanceOf',
    calls: pools.map(p => ({
      target: USDT,
      params: p
    })),
    block,
    chain: 'bsc'
  });

  let lockedAmount = 0;
  lockedTokens.output.forEach((token) => {
    lockedAmount = BigNumber(token.output).plus(lockedAmount).toString(10);
  });

  return {
    [`bsc:${USDT}`]: lockedAmount
  }
}

module.exports = {
  name: "Shield", // project name
  website: "https://shieldex.io",
  category: "Options",
  start: 11160281, // Sep-23-2021 08:37:45 AM +UTC
  bsc: {
    tvl,
  },
  tvl, // tvl adapter
};