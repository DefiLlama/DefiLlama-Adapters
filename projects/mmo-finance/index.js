const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const BigNumber = require("bignumber.js");

const dashboardCronos = "0x55f040E3A6e0ff69f5095B3cbF458919C5e02A0B";
const poolsCronos = [
  "0x443ec402BeC44dA7138a54413b6e09037Cf9CF41",
  "0xB130a35acD62eb4604c6Ba6479D660D97a0A5aBE",
  "0x08d7EBb6fd9dC10EA21a6AA788693aB763616951",
  "0xe2ca90FC315356DecF71133Ba5938153596433f3",
  "0xFf89646FE7Ee62EA96050379A7A8c532dD431d10",
  "0x7A42441f5Cf40cF0fBdA98F494fA2cc500177e86",
  "0x7D35398F35F1dAD6e7a48d6f6E470CB11C77fc46",
  "0xD2B3BDd43Bf5f6f28bD8b12d432afA46a3B20234",
];

const staking = [
  "0x692db42F84bb6cE6A6eA62495c804C71aA6887A7", //MMO single sided
]

const ZERO = new BigNumber(0);
const ETHER = new BigNumber(10).pow(18);

async function TVLPool(timestamp, ethBlock, chainBlock) {
  const block = chainBlock.cronos;
  const total = (
    await sdk.api.abi.multiCall({
      calls: poolsCronos.map((address) => ({
        target: dashboardCronos,
        params: address,
      })),
      block,
      abi: abi,
      chain: "cronos",
    })
  ).output.reduce((tvl, call) => {
    let value = call && call.output && new BigNumber(call.output);
    if (value) {
      return tvl.plus(value.dividedBy(ETHER));
    }
    return tvl;
  }, ZERO);

  return {
    tether: total.toNumber(),
  };
}

async function singleStaking(timestamp, ethBlock, chainBlock) {
  const block = chainBlock.cronos;
  const total = (
    await sdk.api.abi.multiCall({
      calls: staking.map((address) => ({
        target: dashboardCronos,
        params: address,
      })),
      block,
      abi: abi,
      chain: "cronos",
    })
  ).output.reduce((tvl, call) => {
    let value = call && call.output && new BigNumber(call.output);
    if (value) {
      return tvl.plus(value.dividedBy(ETHER));
    }
    return tvl;
  }, ZERO);

  return {
    tether: total.toNumber(),
  };
}

module.exports = {
  misrepresentedTokens: true,
  cronos: {
    tvl: TVLPool,
    staking: singleStaking
  },
  tvl: TVLPool,
};
