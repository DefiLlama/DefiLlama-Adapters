
const utils = require("../helper/utils");
const {  tokensAddress } = require("./constants.js");
// node test.js projects/drops/index.js
const masterchefABI = require("./abis/masterchef.json");
const sdk = require('@defillama/sdk')
const { toUSDTBalances } = require('../helper/balances')
const { sumTokens } = require('../helper/unwrapLPs')

const stakedTVL = async () => {
  const { output: length } = await sdk.api.abi.call({
    target: tokensAddress.masterchef,
    abi: masterchefABI.find(i => i.name === 'poolLength')
  });

  const calls = []
  for (let i = 0; i < length; i += 1)
    calls.push({ params: [i]})

  const { output: data } = await sdk.api.abi.multiCall({
    target: tokensAddress.masterchef,
    abi: masterchefABI.find(i => i.name === 'poolInfo'),
    calls,
  });

  const toa = data.map(i => [i.output.lpToken, tokensAddress.masterchef])
  return sumTokens({}, toa, undefined, undefined, undefined, { resolveLP: true })
};

const fetch = async () => {
  var res = await utils.fetchURL("https://drops.co/status");
  return toUSDTBalances(res.data.TVL)
};

const borrowed = async () => {
  var res = await utils.fetchURL("https://drops.co/status");
  return toUSDTBalances(res.data.totalBorrow)
};

const staking = async () => {
  const stakingTVL = await stakedTVL();
  return stakingTVL;
};

module.exports = {
  timetravel: false,
  methodology:
    "TVL is comprised of tokens deposited to the protocol as collateral, similar to Compound Finance and other lending protocols the borrowed tokens are not counted as TVL.",
  ethereum: {
    tvl: fetch,
    staking, 
    borrowed
  }
};
