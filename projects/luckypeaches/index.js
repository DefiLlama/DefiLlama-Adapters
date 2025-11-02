const sdk = require('@defillama/sdk')
const { aaveExports } = require("../helper/aave");

const config = {
  hemi: ["0x986b04d0a228b8cB81E236F9Add85e43758F21B2"],
}

const data = {};
Object.keys(config).forEach((chain) => {
  const chainExports = config[chain].map((address) => aaveExports(chain, undefined, undefined, [address]))
  data[chain] = {
    tvl: sdk.util.sumChainTvls(chainExports.map(i => i.tvl)),
    borrowed: sdk.util.sumChainTvls(chainExports.map(i => i.borrowed))
  }
});

module.exports = data;
