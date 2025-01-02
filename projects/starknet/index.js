const ADDRESSES = require('../helper/coreAssets.json')
const { get } = require("../helper/http");
const { sumTokens2 } = require("../helper/unwrapLPs");

async function tvl(api) {
  const mapping = await get(
    `https://raw.githubusercontent.com/starknet-io/starknet-addresses/master/bridged_tokens/mainnet.json`
  );
  const tokensAndOwners = mapping.filter(i => i.l1_token_address).map((t) => [
    t.l1_token_address == "0x0000000000000000000000000000000000455448"
      ? "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
      : t.l1_token_address,
    t.l1_bridge_address,
  ]);
  tokensAndOwners.push([
    ADDRESSES.ethereum.DAI,
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
