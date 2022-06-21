const retry = require('async-retry')
const axios = require("axios");
const BigNumber = require("bignumber.js");
const {toUSDTBalances} = require('../helper/balances')

const decimals = new BigNumber(1e6);

async function get_info() {
    const info_url = 'https://api2.towerfinance.io/info';
    return retry(async bail => await axios.get(info_url));
}

async function fetch() {
  const info = await get_info();
  return (new BigNumber(info.data.Value.TVL)).div(decimals).toString();
}

async function safe() {
    const info = await get_info();
    return toUSDTBalances((new BigNumber(info.data.Value.Safe)).div(decimals).toString());
}

async function stake() {
    const info = await get_info();
    return toUSDTBalances((new BigNumber(info.data.Value.Stake)).div(decimals).toString());
}

async function farm() {
    const info = await get_info();
    return toUSDTBalances((new BigNumber(info.data.Value.Farm)).div(decimals).toString());
}

module.exports = {
  polygon: {
      tvl: safe,
      pool2: farm,
      staking: stake
  },
  broken: 'website is down, discord link expired, twitter no longer active. Rugged?'
}