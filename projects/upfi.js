const { getTokenAccountBalance } = require("./helper/solana");
const axios = require("axios");
const retry = require("./helper/retry");

async function pool2() {
  const response = (
    await retry(async (bail) => await axios.get("https://api.upfi.network/tvl"))
  ).data;
  return { 
    'upfi-network': response.UPS_USDC,
    'usd-coin': response.USDC_UPFI + response.UPFI_3Pool,
  }
}

module.exports = {
  timetravel: false,
  methodology: 'TVL data is pulled from the UPFI API "https://api.upfi.network/tvl".',
  pool2: {
    tvl: pool2,
  }
};
