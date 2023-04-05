const { sumTokensExport } = require("../helper/unwrapLPs");

const staking_contract = "0xa8CD01322Ad632c9656879e99Fd7FbC11ca8E3BB";

const assets = [
  "0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4",
  "0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91",
];

module.exports = {
  era: {
    tvl: sumTokensExport({ owner: staking_contract, tokens: assets}),
    staking: sumTokensExport({ owner: staking_contract, tokens: ['0x3a34FA9a1288597Ad6C1Da709f001D37FeF8b19e', '0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4', '0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91']}),
  },
};
