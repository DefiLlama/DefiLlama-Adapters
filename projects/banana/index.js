const axios = require("axios");
const BigNumber = require("bignumber.js");

const tvlUrl = "https://bananafarm.io/api/boba/tvl";

const stakingPid = "0";
const poolPid = "1";

const share = "0xc67b9B1B0557aeAfA10AA1fFa1d7c87087a6149E";
const pool2lp = "0x59b901160bb8eeEc517eD396Ab68e0DA81707c12";

const fetch = async () => {
  const { data } = (await axios.get(tvlUrl)) || {};
  return data?.tvl || 0;
};

const staking = async () => {
  const { data = {} } = (await axios.get(tvlUrl)) || {};
  const tokenAddress = `boba:${share}`;
  return {
    [tokenAddress]: new BigNumber(data[stakingPid] * 1e18).toFixed(0),
  };
};

const pool2 = async () => {
  const { data = {} } = (await axios.get(tvlUrl)) || {};
  const tokenAddress = `boba:${pool2lp}`;
  return {
    [tokenAddress]: new BigNumber(data[poolPid] * 1e18).toFixed(0),
  };
};

module.exports = {
  methodology: `TVL is calculated by summing up the values of all LP tokens and our project's rewards token.`,
  name: "Banana",
  token: "BANA",
  start: 1638237600,
  boba: {
    staking,
    pool2,
    fetch,
  },
  staking,
  pool2,
  fetch,
};
