const { sumTokens2 } = require("../helper/unwrapLPs");
const ADDRESSES = require("../helper/coreAssets.json");

// YieldCore V4.3.2 Core on BSC. New bond deposits are held here.
const YIELDCORE_V432_CORE = "0x903407687486b3ae60746622D06b2eD3D75EaCAb";

// Legacy Cores. Their remaining USDT still backs unsettled legacy bonds and
// must remain in TVL until those obligations have been fully settled.
const YIELDCORE_V3_CORE = "0x2375Fcc2a256425228aA94d7100093230761639e";
const YIELDCORE_V431_CORE = "0x6D6CDf89Cc565A04f0Ba99A1Dc13d43d0d005E4E";

// YieldCore's Krystal PrivateVault, where protocol funds can be deployed.
const KRYSTAL_VAULT = "0xeE9dd48b2Aa7Ab67534c6Da5E1cD261263d46ef7";

async function tvl(api) {
  return sumTokens2({
    api,
    tokens: [ADDRESSES.bsc.USDT],
    owners: [
      YIELDCORE_V432_CORE,
      YIELDCORE_V431_CORE,
      YIELDCORE_V3_CORE,
      KRYSTAL_VAULT,
    ],
  });
}

module.exports = {
  start: "2026-02-06",
  methodology:
    "TVL is the USDT backing YieldCore bonds across the active V4.3.2 Core, " +
    "the legacy V4.3.1 and V3 Cores while unsettled obligations remain, and " +
    "the YieldCore Krystal strategy vault where protocol funds may be deployed.",
  bsc: { tvl },
};
