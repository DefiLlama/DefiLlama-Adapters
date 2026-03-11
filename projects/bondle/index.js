const { sumTokensExport } = require("../helper/unwrapLPs");
const coreAssets = require("../helper/coreAssets.json");

const routers = [
	"0x9272ddC213739Dad3B499C2C1245ff4A2cDe313A",
	"0xc4d1a89d5BCC5A13c59fe2f3820E20B4f5d3095e",
    "0x97b962Ab399beBF439a4a303d9754e79d6925EDa"
];


const tokens = [coreAssets.null];

module.exports = {
	shibarium: {
		tvl: sumTokensExport({ owners: routers, tokens })
	},
};