const { aaveExports } = require("../helper/aave");
const methodologies = require("../helper/methodologies");

module.exports = {
  methodology: methodologies.lendingMarket,
  plume: { tvl: () => ({  }) },
  plume_mainnet: aaveExports("plume_mainnet", undefined, undefined, ['0xEE343bd811500ca27995Bc83D7ec2bacb63680d0'], { v3: true }),
}
