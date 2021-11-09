const sdk = require("@defillama/sdk");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");

const doki = "0x9cEB84f92A0561fa3Cc4132aB9c0b76A59787544";
const azuki = "0x910524678C0B1B23FFB9285a81f99C29C11CBaEd";

// STAKING
const stakingPools = [
  {
    pool: "0x0CE0f2b998C0a1b0280Dcc95935108781d18E65b",
    token: "0x9cEB84f92A0561fa3Cc4132aB9c0b76A59787544",
  }, // DOKI
  {
    pool: "0x4a5573eE3F333260DB50A385F6fFDAc440fc80b1",
    token: "0x9cEB84f92A0561fa3Cc4132aB9c0b76A59787544",
  }, // DOKI
  {
    pool: "0xdf4F609134a84aae1D18dCe8d863b099c6455598",
    token: "0x910524678C0B1B23FFB9285a81f99C29C11CBaEd",
  }, // AZUKI
];

// POOL2 LPS LP
const pool2LPs = [
  {
    owner: "0x95583A6F7aAAA56C48b27413d070219e22844435",
    pool: "0x1D4b2B2a2Ca8762410801b51f128B73743439E39",
  }, // DOKI-ETH
  {
    owner: "0xB89cf3528A3a62C2f58BDbcFd7C15312a33ce91D",
    pool: "0x1D4b2B2a2Ca8762410801b51f128B73743439E39",
  }, // aDOKI-ETH
  {
    owner: "0x27599F0b45008dAD28899e8E278ab191673C9179",
    pool: "0x654def3E97C3F4218C3f49ace81687483C361b2b",
  }, // AZUKI-ETH
];

// POOLS
const pools = [
  {
    pool: "0xb3a2AF499aF8f717BB3431968f8e0b038C975686",
    token: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
  }, // WBTC
  {
    pool: "0xde846827cE3022EcD5eFD6ed316a2dEf9AB299B8",
    token: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  }, // WETH
];

async function tvl(timestamp, block) {
  let balances = {};

  let tokenBalance = (
    await sdk.api.abi.multiCall({
      calls: pools.map((p) => ({
        target: p.token,
        params: p.pool,
      })),
      abi: "erc20:balanceOf",
      block,
    })
  ).output;
  tokenBalance.forEach((i) => {
    sdk.util.sumSingleBalance(balances, i.input.target, i.output);
  });
  return balances;
}

async function pool2(timestamp, block) {
  let balances = {};
  let lpPositions = [];
  let lpBalances = (
    await sdk.api.abi.multiCall({
      calls: pool2LPs.map((p) => ({
        target: p.pool,
        params: p.owner,
      })),
      abi: "erc20:balanceOf",
      block,
    })
  ).output;
  lpBalances.forEach((i) => {
    lpPositions.push({
      balance: i.output,
      token: i.input.target,
    });
  });
  await unwrapUniswapLPs(balances, lpPositions, block);
  return balances;
}

async function staking(timestamp, block) {
  let balances = {};

  let tokenBalance = (
    await sdk.api.abi.multiCall({
      calls: stakingPools.map((p) => ({
        target: p.token,
        params: p.pool,
      })),
      abi: "erc20:balanceOf",
      block,
    })
  ).output;
  tokenBalance.forEach((i) => {
    sdk.util.sumSingleBalance(balances, i.input.target, i.output);
  });

  return balances;
}

module.exports = {
  ethereum: {
    tvl,
    pool2,
    staking,
  },
  tvl,
};
