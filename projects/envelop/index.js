
const { sumTokensExport } = require("../helper/unwrapLPs");
const ADDRESSES = require('../helper/coreAssets.json');

const WRAPPER_ADDRESS = '0xd3807CE2F215DC42ca4bfA616B16C20b0B195128';

const usdb = ADDRESSES.blast.USDB;
const weth = ADDRESSES.blast.WETH;
const _eth = '0x0000000000000000000000000000000000000000';

module.exports = {
	hallmarks: [
		[1709667755, "Contract created"]
	],
	timetravel: true,
	misrepresentedTokens: false,
	methodology: 'TVL is the collateral coins, tokens, NFTs wrapped in Envelop vaults.',
	start: 0,
	blast: {
		tvl: sumTokensExport({
			owner: WRAPPER_ADDRESS,
			tokens: [ _eth, weth, usdb ],
		}),
	}
};
