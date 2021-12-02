const axios = require("axios");

// const share = "0xc67b9b1b0557aeafa10aa1ffa1d7c87087a6149e";
// const pool2lp = "0x59b901160bb8eeec517ed396ab68e0da81707c12";

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
const totalInUsd = async () => {
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
    pool2,
    staking,
    tvl,
  },
  fetch,
};
