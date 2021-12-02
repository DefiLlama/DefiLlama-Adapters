const axios = require("axios");
const { pool2BalanceFromMasterChefExports } = require("../helper/pool2.js");
const masterchefAbi = require("../helper/abis/masterchef.json");

const share = "0xc67b9b1b0557aeafa10aa1ffa1d7c87087a6149e";
// const pool2lp = "0x59b901160bb8eeec517ed396ab68e0da81707c12";
const masterChef = "0x0e69359B4783094260abFaD7dD904999fc1d6Fd0";

const fetch = async () => {
  const { data = {} } =
    (await axios.get("https://bananafarm.io/api/boba/tvl/total")) || {};
  return data.tvl || 0;
};

const tvl = async () => {
  const { data = {} } =
    (await axios.get("https://bananafarm.io/api/boba/tvl")) || {};
  // console.log(0, data);
  return data;
};

const staking = async () => {
  const { data = {} } =
    (await axios.get("https://bananafarm.io/api/boba/tvl/staking")) || {};
  // console.log(1, data);
  return data;
};

const pool2 = async () => {
  const { data = {} } =
    (await axios.get("https://bananafarm.io/api/boba/tvl/pool2")) || {};
  // console.log(2, data);
  return data;
};

module.exports = {
  methodology: `TVL is calculated by summing up the values of all LP tokens and our project's rewards token.`,
  name: "Banana",
  token: "BANA",
  start: 1638237600,
  boba: {
    pool2: pool2BalanceFromMasterChefExports(
      masterChef,
      share,
      "boba",
      (addr) => `boba:${addr}`,
      masterchefAbi.poolInfo
    ),
    staking: staking(masterChef, share, "boba"),
  },
  fetch,
};
