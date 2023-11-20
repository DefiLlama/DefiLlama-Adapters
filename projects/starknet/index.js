const { sumTokens2 } = require("../helper/unwrapLPs");
const axios = require("axios");

async function tvl(_, _b, _c, { api, logArray }) {
  const mapping = await axios.get(
    `https://raw.githubusercontent.com/starknet-io/starknet-addresses/master/bridged_tokens/mainnet.json`
  );
  const tokensAndOwners = mapping.data.map((t) => [
    t.l1_token_address == "0x0000000000000000000000000000000000455448"
      ? "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
      : t.l1_token_address,
    t.l1_bridge_address,
  ]);
  return sumTokens2({
    api,
    tokensAndOwners,
    logArray,
  });
}

module.exports = {
  ethereum: {
    tvl,
  },
};
