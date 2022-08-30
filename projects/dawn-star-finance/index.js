const sdk = require("@defillama/sdk");
const { stakingPricedLP } = require("../helper/staking");
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");
const token0Abi = require("../helper/abis/token0.json");
const token1Abi = require("../helper/abis/token1.json");
const { default: BigNumber } = require("bignumber.js");

let token = "0x095BC617b36AB227A379550633DFDCBf43f236F6";
let share = "0xf8Eed914a0BAcAF30C13420989bB7C81b75D833A";
const rewardPool = "0xfA9f91a340e2eFA47B67921f8809E98796d1f7F7";
const masonry = "0x00c8Ee42761C95B223676d6Ea59c6b7f6f643A6E";
const pool2LPs = [
  "0xfc48B66b9119f1d5fD7C8e72E7e489a5D6C0EF55",
  "0xe1628A0e5250Fa17271Cef1ED4d892cb32D5ADd4"
];

async function pool2(timestamp, block, chainBlocks) {
  const chain = "polygon";
  let balances = {};
  token = token.toLowerCase();
  share = share.toLowerCase();
  block = chainBlocks[chain];
  const pool2Balances = (await sdk.api.abi.multiCall({
    calls: pool2LPs.map(p => ({
      target: p,
      params: rewardPool
    })),
    abi: "erc20:balanceOf",
    block,
    chain
  })).output;
  const supplies = (await sdk.api.abi.multiCall({
    calls: pool2LPs.map(p => ({
      target: p
    })),
    abi: "erc20:totalSupply",
    block,
    chain
  })).output;
  const pool2Token0 = (await sdk.api.abi.multiCall({
    calls: pool2LPs.map(p => ({
      target: p
    })),
    abi: token0Abi,
    block,
    chain
  })).output;
  const pool2Token1 = (await sdk.api.abi.multiCall({
    calls: pool2LPs.map(p => ({
      target: p
    })),
    abi: token1Abi,
    block,
    chain
  })).output;

  for (let i = 0; i < pool2LPs.length; i++) {
    let listedToken;
    const token0 = pool2Token0[i].output.toLowerCase();
    const token1 = pool2Token1[i].output.toLowerCase();
    if (token0 === token || token0 === share) {
      listedToken = token1;
    } else if (token1 === token || token1 === share) {
      listedToken = token0;
    }
    const listedTokenBalance = (await sdk.api.erc20.balanceOf({
      target: listedToken,
      owner: pool2LPs[i],
      block,
      chain
    })).output;
    const balance = BigNumber(pool2Balances[i].output).times(listedTokenBalance).div(supplies[i].output).times(2).toFixed(0);
    console.log(balances);
    sdk.util.sumSingleBalance(balances, `polygon:${listedToken}`, balance);
  }
  return balances;
}

async function tvl(timestamp, block, chainBlocks) {
  const balances = {};
  await sumTokensAndLPsSharedOwners(
    balances,
    [
      ["0xfc48B66b9119f1d5fD7C8e72E7e489a5D6C0EF55", true],
      ["0xe1628A0e5250Fa17271Cef1ED4d892cb32D5ADd4", true],
      ["0x859a50979fdB2A2fD8Ba1AdCC66977C6f6b1CD5B", false],
      ["0x67927780e399d839cba088f75700b49a8896584c", false],
      ["0x6e03c512cba7023fc4812c71d030092e6018f421", false]
    ],
    ["0x195ac6C9Aa3CA737C51ea3bbBd639599e83b6159"],
    chainBlocks.polygon,
    "polygon",
    (addr) => `polygon:${addr}`
  );
  delete balances["polygon:0x095bc617b36ab227a379550633dfdcbf43f236f6"];

  return balances;
};
module.exports = {
  polygon: {
    tvl,
    pool2,
    staking: stakingPricedLP(masonry, share, "polygon", pool2LPs[1], "mmfinance", true)
  }
};