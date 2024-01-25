const { sumTokens } = require("../helper/chain/cosmos");

async function tvl() {
  const owners = ["haqq1jv65s3grqf6v6jl3dp4t6c9t9rk99cd89c30hf"];
  return sumTokens({ owners, chain: "haqq", token: "aISLM" });
}

module.exports = {
  haqq: {
    tvl,
  },
};
