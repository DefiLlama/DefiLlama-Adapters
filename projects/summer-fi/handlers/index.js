const { automationTvl } = require("./automation-v1");
const { dpmPositions } = require("./dpm-positions");
const { makerTvl } = require("./maker-vaults");
const { aaveV3Tvl, ajnaTvl, morphoBlueTvl } = require("./protocols");

module.exports = {
  automationTvl,
  dpmPositions,
  makerTvl,
  aaveV3Tvl,
  ajnaTvl,
  morphoBlueTvl,
};
