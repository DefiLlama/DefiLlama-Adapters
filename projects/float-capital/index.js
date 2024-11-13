const { sumTokens2 } = require("../helper/unwrapLPs");

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

async function polyTvl(api) {
  return sumTokens2({ api, owners: vaults, token: amDAI})
}


async function avaxTvl(api) {
  await sumTokens2({ api, owners: avaults, token: avDAI})
  await sumTokens2({ api, owner: '0xcD62196CC117EA7fd9525ADe37e44d01209e8EBB', token: '0xc988c170d0E38197DC634A45bF00169C7Aa7CA19'})
  return sumTokens2({ api, owner: '0xEb2A90ED68017Ac1B068077C5D1537f4C544036C', token: '0x835866d37afb8cb8f8334dccdaf66cf01832ff5d'})
}

module.exports = {
  polygon: {
    tvl: polyTvl,
  },
  avax: {
    tvl: avaxTvl,
  },
  methodology: `Gets the tokens on markets`,
};
