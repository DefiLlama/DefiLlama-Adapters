const retry = require('async-retry');
const axios = require("axios");

const fetch = async function () {
  const url = 'https://us-central1-tropycofinance.cloudfunctions.net/getTVL';
  const comptroller = '0x10d6d9cfacd77ec2f3b422a4ad7face58197c2e9';

  const tropykusTVL = await retry(async bail => await axios.get(`${url}?comptroller=${comptroller}`));
  return tropykusTVL.data.tvl;
};

module.exports = {
  methodology: "The TVL is calculated by adding the value of total deposits in all markets minus the total borrows.",
  fetch,
};
