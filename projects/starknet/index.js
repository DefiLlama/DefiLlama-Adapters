const { sumTokens2 } = require("../helper/unwrapLPs");
const axios = require("axios");

async function tvl(_, _b, _c, { api }) {
  const mapping = await axios.get(
    `https://raw.githubusercontent.com/starknet-io/starknet-addresses/master/bridged_tokens/mainnet.json`
  );
  const tokensAndOwners = mapping.data.map((t) => [
    t.l1_token_address == "0x0000000000000000000000000000000000455448"
      ? "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
      : t.l1_token_address,
    t.l1_bridge_address,
  ]);
  tokensAndOwners.push([
    "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    "0x0437465dfb5B79726e35F08559B0cBea55bb585C",
  ]);
  return sumTokens2({
    api,
    tokensAndOwners,
  });
}

module.exports = {
  ethereum: {
    tvl,
  },
};
