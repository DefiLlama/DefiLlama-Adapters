const abi = require("./abi.json");
const utils = require("../helper/utils");
const { fetchChainExports } = require("../helper/exports");
const { staking } = require("../helper/staking");
const { pool2BalanceFromMasterChefExports } = require("../helper/pool2");
const { addFundsInMasterChef } = require("../helper/masterchef");
const { transformPolygonAddress } = require("../helper/portedTokens");

const farmContract = "0xdF9401225cC62d474C559E9c4558Fb193137bCEB";
const UMBR = "0xa4bbe66f151b22b167127c770016b15ff97dd35c";

const farmContract_polygon = "0x3756a26De28d6981075a2CD793F89e4Dc5A0dE04";
const UMBR_polygon = "0x2e4b0fb46a46c90cb410fe676f24e466753b469f";

const ethTvl = async (chainBlocks) => {
  const balances = {};

  await addFundsInMasterChef(
    balances,
    farmContract,
    chainBlocks["ethereum"],
    "ethereum",
    (id) => id,
    abi.poolInfo,
    [],
    true,
    true,
    UMBR
  );

  return balances;
};

const polygonTvl = async (chainBlocks) => {
  const balances = {};

  const transformAddress = await transformPolygonAddress();
  await addFundsInMasterChef(
    balances,
    farmContract_polygon,
    chainBlocks["polygon"],
    "polygon",
    transformAddress,
    abi.poolInfo,
    [],
    true,
    true,
    UMBR_polygon
  );

  return balances;
};

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    staking: staking(farmContract, UMBR),
    pool2: pool2BalanceFromMasterChefExports(
      farmContract,
      UMBR,
      "ethereum",
      (id) => id,
      abi.poolInfo
    ),
    tvl: ethTvl,
  },
  polygon: {
    staking: staking(farmContract_polygon, UMBR_polygon, "polygon"),
    pool2: pool2BalanceFromMasterChefExports(
      farmContract_polygon,
      UMBR_polygon,
      "polygon",
      (addr) => `polygon:${addr}`,
      abi.poolInfo
    ),
    tvl: polygonTvl,
  },
  methodology:
    "Counts liquidty of LPs on the Farms and the Assets on the Bridge Pool through Farm Contracts and metrics: https://bridgeapi.umbria.network/api/pool/getTvlAll/?&network=ethereum",
};
