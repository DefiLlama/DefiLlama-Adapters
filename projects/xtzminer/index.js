const { sumTokensExport, nullAddress } = require("../helper/unknownTokens")
const XTZ_MINER_CONTRACT = '0xc0F9a97E46Fb0f80aE39981759eAB4a61eE36459';

module.exports = {
  methodology: "XTZ Miner is a Defi Miners on Etherlink. A fun platform to generate 8%/Day ROI for Lifetime",
  etlk: {
    tvl: sumTokensExport({ owner: XTZ_MINER_CONTRACT, tokens: [nullAddress] }),
  }
}
