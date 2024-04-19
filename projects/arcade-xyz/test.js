const { stakingTvl } = require('./staking_queries.js');
const { CHAIN } = require('./staking_constants');

const timestamp = Math.floor(Date.now() / 1000);
const block = 19691786;
const chainBlocks = { [CHAIN]: block };

// to run: node projects/arcade-xyz/test.js

async function main() {
  try {
    const balances = await stakingTvl(timestamp, block, chainBlocks);
    console.log("Final Balances:", balances);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    process.exit();
  }
}

main();
