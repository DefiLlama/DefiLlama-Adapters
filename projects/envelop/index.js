
const { sumTokensExport } = require("../helper/unwrapLPs");
const ADDRESSES = require('../helper/coreAssets.json');

const WRAPPER_ADDRESS = '0xd3807CE2F215DC42ca4bfA616B16C20b0B195128';

module.exports = {
	hallmarks: [
		[1709667755, "Contract created"]
	],
	methodology: 'TVL is the collateral coins, tokens, NFTs wrapped in Envelop vaults.',
	blast: {
		tvl: sumTokensExport({
			owner: WRAPPER_ADDRESS,
			tokens: [ADDRESSES.null, ADDRESSES.blast.WETH, ADDRESSES.blast.USDB,],
		}),
	}
};
