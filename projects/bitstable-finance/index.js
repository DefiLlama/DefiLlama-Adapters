const ADDRESS = require("../helper/coreAssets.json");
const { sumTokensExport } = require("../helper/unwrapLPs");

const owner = "0x103dd1184599c7511a3016E0a383E11F84AE7173";
const tokens = {
  ethereum: [ADDRESS.ethereum.USDT],
  bsc: ['0xc5f0f7b66764F6ec8C8Dff7BA683102295E16409'],
};

Object.keys(tokens).map((chain) => {
  module.exports[chain] = {
    tvl: sumTokensExport({ owner, tokens: tokens[chain] }),
  };
});

module.exports.methodology = "Staking tokens via BitStable counts as TVL";
