const { graphQuery } = require("../helper/http");
const { sumTokens2 } = require("../helper/unwrapLPs");

const MintingHub = "0x7bbe8F18040aF0032f4C2435E7a76db6F1E346DF";
const Collaterals = ["0xb4272071ecadd69d933adcd19ca99fe80664fc08"]; // XCHF

const fetchPositions = async () => {
  const url =
    "https://api.thegraph.com/subgraphs/name/frankencoin-zchf/frankencoin-subgraph";
  const query = `
    query {
      positions {
        id
        position
        collateral
      }
    }`;
  const { positions } = await graphQuery(url, query);

  const pos = [];
  const collaterals = [];
  positions.forEach((position) => {
    pos.push(position.position);
    collaterals.push(position.collateral);
  });

  return {
    positions: pos,
    collaterals,
  };
};

const getTvl = async (_, ethBlock, __, { api }) => {
  const { positions, collaterals } = await fetchPositions();

  return sumTokens2({
    owners: [...positions, MintingHub],
    tokens: [...collaterals, ...Collaterals],
    api,
  });
};

module.exports = {
  ethereum: {
    tvl: getTvl,
  },
  start: 1698487043,
};
