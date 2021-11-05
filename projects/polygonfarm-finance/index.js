const sdk = require("@defillama/sdk");
const { addFundsInMasterChef } = require("../helper/masterchef");
const { transformPolygonAddress } = require("../helper/portedTokens");
const { pool2Exports } = require("../helper/pool2");
const { staking } = require("../helper/staking");

const spadeToken = "0xf5EA626334037a2cf0155D49eA6462fDdC6Eff19";
const masterchef = "0x9A2C85eFBbE4DD93cc9a9c925Cea4A2b59c0db78";

const pool2LPs = [
  "0xCcCEc4A90b3435065f5e1feC6346be9Da1B7B5eD", // SPADE-WMATIC SUSHI
  "0x6Fd8aAe9f85A7Db14c45453daAB81aa3085E4bA3", // SPADE-USDC SUSHI
  "0x46A139e6f19b69F5D383F1e1a10BDfb8D3E03f1F", // SPADE-WMATIC UNI
];

async function tvl(timestamp, block, chainBlocks) {
  let balances = {};

  const transformedAddress = await transformPolygonAddress();

  let ignoreAddress = pool2LPs;
  ignoreAddress.push(spadeToken);

  await addFundsInMasterChef(
    balances,
    masterchef,
    chainBlocks.polygon,
    "polygon",
    transformedAddress,
    undefined,
    ignoreAddress,
  );

  return balances;
}

module.exports = {
  polygon: {
    tvl,
    pool2: pool2Exports(masterchef, pool2LPs, "polygon"),
    staking: staking(masterchef, spadeToken, "polygon"),
  },
  tvl,
};
