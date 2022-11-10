const axios = require("axios");
const retry = require("async-retry");
const {staking} = require("../helper/staking");
const {toUSDTBalances} = require("../helper/balances");
const sdk = require("@defillama/sdk");

async function getPlatformData() {
  const response = await retry(async (_) =>
    axios.get("https://55vvs1ddm4.execute-api.eu-central-1.amazonaws.com/default/tvl")
  );
  return response.data;
}

const vlty = "0x38A5cbe2FB53d1d407Dd5A22C4362daF48EB8526"
const stakingContract = "0x52168c7E798b577DB2753848f528Dc04db26c8ad"

async function tvl() {
  const total = (await getPlatformData()).general.tvl;
  return toUSDTBalances(total)
}

module.exports = {
  misrepresentedTokens: true,
  methodology: 'TVL counts the tokens deposited to all vaults',
  bsc:{
    staking: staking(stakingContract, vlty, "bsc"),
    tvl
  }
};