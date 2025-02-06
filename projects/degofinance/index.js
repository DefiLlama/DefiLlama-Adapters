const { sumTokensExport } = require("../helper/unwrapLPs");
const coreAssets = require("../helper/coreAssets.json");


const ethereumContracts = [
    "0x28681d373aF03A0Eb00ACE262c5dad9A0C65F276",
    "0x781a0861395Ba245e8254a61e74B0e7cD3Ac8eAf"
];

const existingTokens = [
    coreAssets.null,
    coreAssets.ethereum.WETH,
    coreAssets.ethereum.USDT
];

module.exports = {
  ethereum: {
    tvl: sumTokensExport({ owners: ethereumContracts, tokens: existingTokens })
  }
};
