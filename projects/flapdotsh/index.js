const { sumTokensExport } = require("../helper/unwrapLPs");
const coreAssets = require("../helper/coreAssets.json");
const ADDRESSES = require('../helper/coreAssets.json')

const portal = [
	"0xe2ce6ab80874fa9fa2aae65d277dd6b8e65c9de0",
];

const tokens = [coreAssets.null];

module.exports = {
	bsc: {
		tvl: sumTokensExport({ owners: portal, tokens })
	},
  xlayer: {
    tvl: sumTokensExport({ owner: '0xb30D8c4216E1f21F27444D2FfAee3ad577808678', tokens: [ADDRESSES.null, ADDRESSES.xlayer.WOKB, '0x779ded0c9e1022225f8e0630b35a9b54be713736'] }),
  },
};