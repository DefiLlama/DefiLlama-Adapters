const { sumTokens } = require("../helper/chain/elrond");
const { getConfig } = require("../helper/cache");
const { getCoreAssets } = require("../helper/tokenMapping");

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

async function tvl() {
  const daoAddresses = await getDaoAddresses();
  return await sumTokens({
    owners: [...PROTOCOL_ADDRESSES, ...daoAddresses],
    whitelistedTokens: getCoreAssets("elrond"),
  });
}

async function vestingTvl() {
  const daoAddresses = await getDaoAddresses();
  return await sumTokens({
    owners: [...PROTOCOL_ADDRESSES, ...daoAddresses],
    blacklistedTokens: getCoreAssets("elrond"),
  });
}

module.exports = {
  timetravel: false,
  elrond: {
    tvl,
    vesting: vestingTvl,
  },
};
