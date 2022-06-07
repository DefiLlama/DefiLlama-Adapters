const sdk = require("@defillama/sdk");
const { calculateUniTvl } = require("../helper/calculateUniTvl.js");

const ALMToken = "0x7C38870e93A1f959cB6c533eB10bBc3e438AaC11";
const stakingPool = "0x4f388167F8B52F89C87A4E46706b9C1408F2c137"; // Strong Holder Pool

const bscFactory = "0xbEAC7e750728e865A3cb39D5ED6E3A3044ae4B98";

async function bscTvl(timestamp, block, chainBlocks) {
  return calculateUniTvl(
    (addr) => `bsc:${addr}`,
    chainBlocks.bsc,
    "bsc",
    bscFactory,
    0,
    true
  );
}

async function bscStaking(timestamp, block, chainBlocks) {
  let balances = {};

  let { output: balance } = await sdk.api.erc20.balanceOf({
    target: ALMToken,
    owner: stakingPool,
    block: chainBlocks.bsc,
    chain: "bsc",
  });

  sdk.util.sumSingleBalance(balances, `bsc:${ALMToken}`, balance);

  return balances;
}

module.exports = {
  bsc: {
    tvl: bscTvl,
    staking: bscStaking,
  },
  
};
