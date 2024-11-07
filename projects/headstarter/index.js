const { sumTokens2 } = require("../helper/unwrapLPs");

const STAKING_CONTRACT = "0x000000000000000000000000000000000070eac5";
const HST = "0x00000000000000000000000000000000000ec585";

const ENTITIES = [
  {
    token: "0x000000000000000000000000000000000048fda4",
    contracts: [
      "0x00000000000000000000000000000000004e3387",
      "0x00000000000000000000000000000000004e3395",
      "0x00000000000000000000000000000000004d6daa",
      "0x0000000000000000000000000000000000575c04",
    ],
  },
  {
    token: "0x000000000000000000000000000000000030fb8b",
    contracts: [
      "0x00000000000000000000000000000000005737f0",
      "0x00000000000000000000000000000000005737e1",
      "0x0000000000000000000000000000000000571a8d",
      "0x0000000000000000000000000000000000571a8a",
      "0x000000000000000000000000000000000056d9ea",
      "0x0000000000000000000000000000000000575c04",
    ],
  },
  {
    token: "0x00000000000000000000000000000000005c9f70",
    contracts: [
      "0x00000000000000000000000000000000005cb45b",
      "0x00000000000000000000000000000000005cb45f",
      "0x0000000000000000000000000000000000575c04",
    ],
  },
];

const HST_ENTITIES = [
  {
    token: HST,
    contracts: [
      STAKING_CONTRACT,
      "0x00000000000000000000000000000000000f5ad1",
      "0x00000000000000000000000000000000000fc16c",
      "0x0000000000000000000000000000000000101201",
      "0x0000000000000000000000000000000000575c04",
    ],
  },
];

const getTokensAndOwners = (entities) => {
  return entities.map(({ token, contracts}) => contracts.map(i => [token, i])).flat();
};

const tvl = async (api) => {
  const tokensAndOwners = getTokensAndOwners(ENTITIES);
  return sumTokens2({api,  tokensAndOwners });
};

const staking = async (api) => {
  const  tokensAndOwners = getTokensAndOwners(HST_ENTITIES);
  return sumTokens2({api,  tokensAndOwners });
};

module.exports = {
  methodology: "We count the HST tokens locked in the HeadStarter contracts.",
  hedera: {
    tvl,
    staking,
  },
};
