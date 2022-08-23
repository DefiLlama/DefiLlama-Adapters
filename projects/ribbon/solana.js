const retry = require("../helper/retry");
const axios = require("axios");

const tvl = async () => {
  const vault = await retry(
    async () => await axios.get("https://solana-vault.uc.r.appspot.com/tvl")
  );


  return {
    solana: +vault.data.sol.tvl
  };
};

module.exports = {
  solana: {
    tvl,
  },
};
