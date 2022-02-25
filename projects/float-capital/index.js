const { sumTokens, unwrapCreamTokens } = require("../helper/unwrapLPs");

const vaults = [
  "0xce5da4bebBA980BeC39da5b118750A47a23D4B85",
  "0x595b1408C9c2BF121c7674E270Ca7aCc0bBf100C",
  "0x694c240e63CF60a2cD2d38d84D902744640AcCDA",
  "0x92f29DfceA469ab498ade826FB41d065482B6abA",
  "0xB26289Bee42Aa1ad51466dc28e68ab89f0541A7f",
  "0x1372276638bFc1FCe909B05783D91e526B801669",
  "0x38c23db64e4a22A9f277216a34A88f5a1fB3Cf5e",
];
const amDAI = "0x27f8d03b3a2196956ed754badc28d73be8830a6e";
const avaults = [
  "0xefE423827b87751f9EB91A90a78edc624601565b",
  "0x621cda10820555adAe8506eeC296cB9621E491Ff",
  "0x47a21F14794b6229cc2a1ddfe4498C9e48f1C16c",
];
const avDAI = "0x47afa96cdc9fab46904a55a6ad4bf6660b53c38a";
const DAI = "0xd586e7f844cea2f87f50152665bcbc2c279d8d70";
const transforms = {
  "0x47afa96cdc9fab46904a55a6ad4bf6660b53c38a":
    "0x6b175474e89094c44da98b954eedeac495271d0f", // avDAI
  "0xd586e7f844cea2f87f50152665bcbc2c279d8d70":
    "0x6b175474e89094c44da98b954eedeac495271d0f", // DAI
};

async function polyTvl(time, ethBlock, chainBlocks) {
  const balances = {};
  await sumTokens(
    balances,
    vaults.map((v) => [amDAI, v]),
    chainBlocks.polygon,
    "polygon",
    (addr) => `polygon:${addr}`
  );
  return balances;
}

const qiDAI = "avax:0x835866d37afb8cb8f8334dccdaf66cf01832ff5d"

async function avaxTvl(time, ethBlock, chainBlocks) {
  const balances = {};
  await sumTokens(
    balances,
    avaults.map((v) => [avDAI, v]),
    chainBlocks.avax,
    "avax",
    (addr) => {
      return transforms[addr.toLowerCase()] ?? `avax:${addr}`;
    }
  );
  await unwrapCreamTokens(
    balances,
    [
      ["0x835866d37afb8cb8f8334dccdaf66cf01832ff5d", "0xEb2A90ED68017Ac1B068077C5D1537f4C544036C"]
    ],
    chainBlocks.avax,
    "avax",
    (addr) => {
      return transforms[addr.toLowerCase()] ?? `avax:${addr}`;
    }
  );
  return balances;
}
// node test.js projects/float-capital/index.js
module.exports = {
  polygon: {
    tvl: polyTvl,
  },
  avax: {
    tvl: avaxTvl,
  },
  methodology: `Gets the tokens on markets`,
};
