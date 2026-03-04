const ADDRESSES = require("../helper/coreAssets.json");

const GAME_CONTRACT = "0x051B5a8B20F3e49E073Cf7A37F4fE2e5117Af3b6";

async function tvl(api) {
  return api.sumTokens({
    owners: [GAME_CONTRACT],
    tokens: [ADDRESSES.null],
  });
}

module.exports = {
  methodology: "TVL is the native ETH held in the Megamble game contract. This includes the active pot and player credits. Treasury funds distributed externally are excluded.",
  megaeth: {
    tvl,
  },
};

