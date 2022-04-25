const axios = require("axios");
const BigNumber = require("bignumber.js");

async function tvl() {
  const { data } = await axios.post("https://api.duet.finance/api/tvlinfo",
    "token=0x0000000000000000000000000000000000000000",
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    });

  return new BigNumber(data.data.week[0].tvl).div(100000000).toFixed(0);
}

module.exports = {
  timetravel: false,
  methodology: "TVL is the sum of all tokens in the staking pools",
  bsc: {
    tvl
  }
};
