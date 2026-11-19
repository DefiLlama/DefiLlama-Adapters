const { sumTokens } = require("../helper/chain/elrond");
const { getConfig } = require("../helper/cache");
const { getCoreAssets } = require("../helper/tokenMapping");
const { transformBalances } = require("../helper/portedTokens");
const sdk = require("@defillama/sdk");

const API_BASE_URL = "https://api.peerme.io";

const PROTOCOL_ADDRESSES = [
  "erd1qqqqqqqqqqqqqpgqda336kqnhevc4p5myegjkjm8ew0r4x8927rsp6szng", // org
  "erd1qqqqqqqqqqqqqpgqdj70la9z3x22exu7hmhws0a6z0waf92y27rsgudkq5", // earn module
  "erd1qqqqqqqqqqqqqpgqakyy2eaxmv7njv2z6fn4p9makpty3lfpl3tshxnz97", // bounties
];

async function getDaoAddresses() {
  return (await getConfig(
    "peerme",
    API_BASE_URL + "/integrations/defi-llama/dao-addresses"
  )).filter(address => address !== null);
}

// The elrond helper pauses between owners, so reading every DAO twice (once for tvl, once for vesting)
// doubled the run. Balances are read once per process and split into core assets (tvl) and the rest (vesting).
let balancesPromise;
function getSplitBalances() {
  if (!balancesPromise) balancesPromise = fetchSplitBalances();
  return balancesPromise;
}

async function fetchSplitBalances() {
  const daoAddresses = await getDaoAddresses();
  const all = await sumTokens({ owners: [...PROTOCOL_ADDRESSES, ...daoAddresses] });
  // the helper prefixes and renames token ids in its output, so core assets are matched by the keys it would produce
  const coreBalances = {};
  getCoreAssets("elrond").forEach(t => sdk.util.sumSingleBalance(coreBalances, t, "1", "elrond"));
  const coreKeys = new Set(Object.keys(transformBalances("elrond", coreBalances)));
  const core = {};
  const rest = {};
  for (const [key, value] of Object.entries(all)) (coreKeys.has(key) ? core : rest)[key] = value;
  return { core, rest };
}

async function tvl() {
  return { ...(await getSplitBalances()).core };
}

async function vestingTvl() {
  return { ...(await getSplitBalances()).rest };
}

module.exports = {
  timetravel: false,
  elrond: {
    tvl,
    vesting: vestingTvl,
  },
};
