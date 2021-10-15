const sdk = require("@defillama/sdk");
const { addFundsInMasterChef } = require("../helper/masterchef");
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");
const {
  transformFantomAddress,
  transformBscAddress,
  transformPolygonAddress,
} = require("../helper/portedTokens");

const MasterChefContractFantom = "0x1CA27c8f19EF84F5f5A9cf2E2874E4Bf91fD38C4";
const MasterChefContractBsc = "0x8E934F14bD904A46e0C8aF7de6aEeAaaa0D8C2c5";
const MasterChefContractPolygon = "0x9bFcf65e7De424a6D89Eef23B3dF8cdc965c654F";

const CBankContractFntm = [
  "0x638214E425D497a44d088c394C85E6fbc32C6AEf",
  "0x0f9B6b04b3517E6d0CB75D96CA08959010A0F116",
];

const tokensAddress = [
  //CGS
  "0x5a2e451fb1b46fde7718315661013ae1ae68e28c",
  //WFTM
  "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83",
];

const calcTvl = async (
  balances,
  chain,
  block,
  masterchef,
  transformAddress
) => {
  await addFundsInMasterChef(
    balances,
    masterchef,
    block,
    chain,
    transformAddress
  );
};

const fantomTvl = async (chainBlocks) => {
  const balances = {};

  let transformAddress = await transformFantomAddress();
  await calcTvl(
    balances,
    "fantom",
    chainBlocks["fantom"],
    MasterChefContractFantom,
    transformAddress
  );

  for (const token of tokensAddress) {
    await sumTokensAndLPsSharedOwners(
      balances,
      [[token, false]],
      CBankContractFntm,
      chainBlocks["fantom"],
      "fantom",
      transformAddress
    );
  }

  return balances;
};

const bscTvl = async (chainBlocks) => {
  const balances = {};

  let transformAddress = await transformBscAddress();
  await calcTvl(
    balances,
    "bsc",
    chainBlocks["bsc"],
    MasterChefContractBsc,
    transformAddress
  );

  return balances;
};

const polygonTvl = async (chainBlocks) => {
  const balances = {};

  let transformAddress = await transformPolygonAddress();
  await calcTvl(
    balances,
    "polygon",
    chainBlocks["polygon"],
    MasterChefContractPolygon,
    transformAddress
  );

  return balances;
};

module.exports = {
  misrepresentedTokens: true,
  fantom: {
    tvl: fantomTvl,
  },
  bsc: {
    tvl: bscTvl,
  },
  polygon: {
    tvl: polygonTvl,
  },
  tvl: sdk.util.sumChainTvls([fantomTvl, bscTvl, polygonTvl]),
  methodology:
    "We count liquidity on the Farms and Pools seccions through MasterChef Contracts",
};
