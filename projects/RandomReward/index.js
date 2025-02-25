const { sumTokensExport, nullAddress } = require("../helper/unwrapLPs");

const RR_ETHEREUM = '0x5ec1e43163b303b13fea20a892cba7e5568d8a8f';

module.exports = {
    methodology: `Total ETH held in the Random Reward contract, available for distribution.`,
    ethereum: { tvl: sumTokensExport({ owner: RR_ETHEREUM, tokens: [nullAddress]}), },
  };