const { sumTokensExport } = require("../helper/unwrapLPs");
const coreAssets = require("../helper/coreAssets.json");

const routers = [
	"0xF6Af6C034E92694A4c79569B03543d580df402D7",
	"0x992D40d9ED8937Bb0Ad3c0Ba99713072Ae0a05b3",
	"0x135De7F9223C76b7d0278FFe854eC480D37FE906"
];

const tokens = [coreAssets.null];

module.exports = {
	base: {
		tvl: sumTokensExport({ owners: routers, tokens })
	},
};