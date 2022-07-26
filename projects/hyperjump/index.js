const { calculateUniTvl } = require("../helper/calculateUniTvl.js");
const { getChainTvl } = require("../helper/getUniSubgraphTvl");
const {
  transformFantomAddress,
  transformBscAddress,
  transformMetisAddress,
} = require("../helper/portedTokens");

const FACTORY = {
  bsc: "0xac653ce27e04c6ac565fd87f18128ad33ca03ba2",
  fantom: "0x991152411A7B5A14A8CF0cDDE8439435328070dF",
  metis: "0xAA1504c878B158906B78A471fD6bDbf328688aeB",
};

const MASTERCHEF = {
  bsc: "0x1985CD7aF3B410Cfe87B59EAF8A0833816729c49",
  fantom: "0xb0AA3a0458BD85F859345e2251C7665C5f7A9d18",
  metis: "0x7B649F38286231755FFccBe6C82E8d7529800eD4",
};

async function fantomTvl(timestamp, block, chainBlocks) {
  const transform = await transformFantomAddress();
  return calculateUniTvl(
    transform,
    chainBlocks["fantom"],
    "fantom",
    FACTORY["fantom"],
    0,
    true
  );
}

async function metisTvl(timestamp, block, chainBlocks) {
  const transform = await transformMetisAddress();
  return calculateUniTvl(
    transform,
    chainBlocks["metis"],
    "metis",
    FACTORY["metis"],
    0,
    true
  );
}

async function bscTvl(timestamp, block, chainBlocks) {
  const transform = await transformBscAddress();
  return calculateUniTvl(
    transform,
    chainBlocks["bsc"],
    "bsc",
    FACTORY["bsc"],
    0,
    true
  );
}

module.exports = {
  methodology: "Liquidity on DEX pools",
  fantom: { tvl: fantomTvl },
  bsc: {
    tvl: bscTvl,
  },
  metis: { tvl: metisTvl },
};
