const sdk = require("@defillama/sdk");
const axios = require("axios");
const apiInfo = require("./apiInfo.json");
const { stakings } = require("../helper/staking");

const addresses = {
  elfi: "0x4da34f8264cb33a5c9f17081b9ef5ff6091116f4",
  el: "0x2781246fe707bb15cee3e5ea354e2154a2877b16",
  elStaking: "0x3F0c3E32bB166901AcD0Abc9452a3f0c5b8B2C9D",
  dai: "0x6b175474e89094c44da98b954eedeac495271d0f",
  usdt: "0xdac17f958d2ee523a2206206994597c13d831ec7",
  busd: "0x4fabb145d64652a948d72533023f6e7a623c7c53",
  usdc: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  elfiStaking: [
    "0xb41bcd480fbd986331eeed516c52e447b50dacb4",
    "0xCD668B44C7Cf3B63722D5cE5F655De68dD8f2750",
    "0x24a7fb55e4ac2cb40944bc560423b496dfa8803f",
  ],
  bscElfi: "0x6C619006043EaB742355395690c7b42d3411E8c0",
  bscElfiStaking: [
    "0x73653254ED0F28D6E5A59191bbB38B06C899fBcA",
    "0x861c2221e4d73a97cd94e64c7287fd968cba03e4",
  ],
};

async function getEthereumTvl(timestamp, block, chainBlocks) {
  const balances = {};

  const reserves = (
    await axios.post(
      apiInfo["elyfi-subgraph"].endpoint,
      apiInfo["elyfi-subgraph"].body
    )
  ).data.data.reserves;

  const elStakingValue = (
    await sdk.api.abi.call({
      target: addresses.el,
      params: addresses.elStaking,
      abi: "erc20:balanceOf",
      block,
    })
  ).output;

  sdk.util.sumSingleBalance(balances, addresses.el, elStakingValue);
  sdk.util.sumSingleBalance(balances, addresses.dai, reserves[0].totalDeposit);
  sdk.util.sumSingleBalance(balances, addresses.usdc, reserves[1].totalDeposit);
  sdk.util.sumSingleBalance(balances, addresses.usdt, reserves[2].totalDeposit);

  return balances;
}

async function getBscTvl(timestamp, block, chainBlocks) {
  const balances = {};

  const reserves = (
    await axios.post(
      apiInfo["elyfi-subgraph-bsc"].endpoint,
      apiInfo["elyfi-subgraph-bsc"].body
    )
  ).data.data.reserves;

  sdk.util.sumSingleBalance(balances, addresses.busd, reserves[0].totalDeposit);

  return balances;
}

module.exports = {
  timetravel: false,
  ethereum: {
    tvl: getEthereumTvl, // el staking + dai deposit + usdt deposit
    staking: stakings(addresses.elfiStaking, addresses.elfi),
  },
  bsc: {
    tvl: getBscTvl,
    staking: stakings(addresses.bscElfiStaking, addresses.bscElfi, "bsc"),
  },
}; // node test.js projects/elysia/index.js
