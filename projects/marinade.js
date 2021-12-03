const retry = require("async-retry");
const axios = require("axios");

async function tvl() {
  var response = await retry(
    async (bail) => await axios.get("https://api.marinade.finance/tlv")
  );

  return {
    solana: response.data.total_sol || 0,
  };
}

module.exports = {
  timetravel: false,
  tvl,
  methodology: `To obtain the Marinade Finance TVL we make a dedicated API endpoint in our REST server. It is using values from the database with a separate update process. The *_sol fields of returned JSON object contains a number of SOL tokens held in our contract for us to then use Coingecko to get the price of SOL token in USD and export it. We are counting only SOL tokens because all other tokens used in our contract are mintable by us and represents a value of locked SOL tokens to our customers`,
};
