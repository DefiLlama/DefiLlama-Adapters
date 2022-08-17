const sdk = require("@defillama/sdk");
const { calculateUniTvl } = require("../helper/calculateUniTvl.js");

const ALMToken = "0x7C38870e93A1f959cB6c533eB10bBc3e438AaC11";
const stakingPool0 = "0x95CDf618b6aF0ec1812290A777955D3609B0508d"; // Strong Holder Pool
const stakingPool1 = "0x4f388167F8B52F89C87A4E46706b9C1408F2c137"; // Old Strong Holder Pool

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

  let { output: balance0 } = await sdk.api.erc20.balanceOf({
    target: ALMToken,
    owner: stakingPool0,
    block: chainBlocks.bsc,
    chain: "bsc",
  });
  
  let { output: balance1 } = await sdk.api.erc20.balanceOf({
    target: ALMToken,
    owner: stakingPool1,
    block: chainBlocks.bsc,
    chain: "bsc",
  });

  sdk.util.sumSingleBalance(balances, `bsc:${ALMToken}`, balance0);
  sdk.util.sumSingleBalance(balances, `bsc:${ALMToken}`, balance1);

  return balances;
}

module.exports = {
  bsc: {
    tvl: bscTvl,
    staking: bscStaking,
  },
  
};
