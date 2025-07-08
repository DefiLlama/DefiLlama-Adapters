const { sumTokensExport } = require("../helper/unwrapLPs");
const coreAssets = require("../helper/coreAssets.json");

const portal = [
	"0xe2ce6ab80874fa9fa2aae65d277dd6b8e65c9de0",
];

const tokens = [coreAssets.null];

module.exports = {
	bsc: {
		tvl: sumTokensExport({ owners: portal, tokens })
	},
};