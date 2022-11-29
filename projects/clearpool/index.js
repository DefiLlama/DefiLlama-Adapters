const sdk = require("@defillama/sdk");
const { sumTokens } = require("../helper/unwrapLPs");
const abi = require("./abi.json");
const { get } = require('../helper/http')
const { staking } = require('../helper/staking')

const PoolFactory = "0xde204e5a060ba5d3b63c7a4099712959114c2d48";
const START_BLOCK = 14443222;
const polygonPoolURL = 'https://api-v3.clearpool.finance/137/pools'
const ethereumTVL = async (timestamp, block, chainBlocks) => {
  const balances = {};
  const Logs = (
    await sdk.api.util.getLogs({
      target: PoolFactory,
      topic: "PoolCreated(address,address,address)",
      keys: [],
      fromBlock: START_BLOCK,
      toBlock: block,
    })
  ).output;
  const tokensAndOwners = [];
  for (let i = 0; i < Logs.length; i++) {
    const pool = "0x" + Logs[i].topics[1].substring(26, 66);
    const token = "0x" + Logs[i].topics[3].substring(26, 66);
    tokensAndOwners.push([token, pool]);
  }
  await sumTokens(balances, tokensAndOwners, block);
  return balances;
};
const ethereumBorrowed = async (timestamp, block, chainBlocks) => {
  const totalBorrowed = {};
  const Logs = (
    await sdk.api.util.getLogs({
      target: PoolFactory,
      topic: "PoolCreated(address,address,address)",
      keys: [],
      fromBlock: START_BLOCK,
      toBlock: block,
    })
  ).output;
  const pools = []
  const tokens = []
  for (let i = 0; i < Logs.length; i++) {
    const pool = "0x" + Logs[i].topics[1].substring(26, 66);
    const token = "0x" + Logs[i].topics[3].substring(26, 66);
    pools.push(pool)
    tokens.push(token)
  }
  const { output: borrowed } = await sdk.api.abi.multiCall({
    abi: abi.borrows,
    calls: pools.map(i => ({ target: i })),
    block,
  })
  borrowed.forEach((data, i) => sdk.util.sumSingleBalance(totalBorrowed, tokens[i], data.output))
  return totalBorrowed;
};

const polygonTvl = async (timestamp, _,  { polygon: block }) => {
  const balances = {};
  const chain = 'polygon'
  const poolData = await get(polygonPoolURL)
  const tokensAndOwners = [];
  for (let i = 0; i < poolData.length; i++) {
    const pool = poolData[i].address;
    const token = poolData[i].currency.address;
    tokensAndOwners.push([token, pool]);
  }
  await sumTokens(balances, tokensAndOwners, block, chain);
  return balances;
};
const polygonBorrowed = async (timestamp, _,  { polygon: block }) => {
  const chain = 'polygon'
  const poolData = await get(polygonPoolURL)
  const totalBorrowed = {};
  const pools = []
  const tokens = []
  for (let i = 0; i < poolData.length; i++) {
    const pool = poolData[i].address;
    const token = poolData[i].currency.address;
    pools.push(pool)
    tokens.push(token)
  }
  const { output: borrowed } = await sdk.api.abi.multiCall({
    abi: abi.borrows,
    calls: pools.map(i => ({ target: i })),
    chain, block,
  })
  borrowed.forEach((data, i) => sdk.util.sumSingleBalance(totalBorrowed, chain + ':' + tokens[i], data.output))
  return totalBorrowed;
};


const singleStakingContracts = [
  "0x629E39da1Db5654fe59cAE31d48CAEBB8dC2A9c6",
];

const CPOOL = "0x66761fa41377003622aee3c7675fc7b5c1c2fac5";

//  node test.js projects/clearpool/index.js
module.exports = {
  timetravel: false,
  ethereum: {
    tvl: ethereumTVL,
    borrowed: ethereumBorrowed,
    staking: staking(singleStakingContracts, CPOOL),
  },
  polygon: {
    tvl: polygonTvl,
    borrowed: polygonBorrowed,
  },
  methodology: "We count liquidity by USDC deposited on the pools contracts",
};
