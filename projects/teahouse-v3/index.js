const abi = require("./abi.json");
const { getConfig } = require("../helper/cache");

// teahouse public api for vault
const teahouseVaultAPI = "https://vault-content-api.teahouse.finance/vaults";

// get vault contract addresses from teahouse api
async function getVaultContractsAddress(chain) {
	let pairVault = [];
	let portVault = []
	const { vaults } = await getConfig("teahouse/v3", teahouseVaultAPI);
	vaults.forEach((element) => {
		// permissionless vaults
		if (element.isDeFi == true && element.isActive == true) {
			if (element.chain === chain) {
				const type = element.type.toLowerCase();
				if (type === 'v3pair') {
					pairVault.push(element.share.address);
				} else if (type === 'v3port') {
					portVault.push(element.share.address);
				}
			};
		}
	});
	return {
		pair: pairVault,
		port: portVault
	};
}

const chains = ["ethereum", "optimism", "arbitrum", 'polygon', 'boba', 'mantle'];

chains.forEach((chain) => {
	module.exports[chain] = {
		tvl: async (api) => {
			const vaults = await getVaultContractsAddress(chain);

			let tokens = await api.multiCall({
				abi: abi.assetToken1,
				calls: vaults.pair,
			});
			let bals = await api.multiCall({
				abi: abi.estimatedValueIntoken1,
				calls: vaults.pair,
			});
			api.addTokens(tokens, bals);

			tokens = await api.multiCall({
				abi: abi.assets,
				calls: vaults.port.map((address) => ({ target: address, params: [0n] })),
			});
			bals = await api.multiCall({
				abi: abi.calculateTotalValue,
				calls: vaults.port,
			});
			const tokenDecimals = await api.multiCall({
				abi: abi.decimals,
				calls: tokens
			});

			for (let i = 0; i < tokens.length; i++) {
				const tDecimals = BigInt(tokenDecimals[i]);
				if (tDecimals < 18n) {
					bals[i] = (BigInt(bals[i]) / 10n ** (18n - tDecimals)).toString();
				} else {
					bals[i] = (BigInt(bals[i]) * 10n ** (tDecimals - 18n)).toString();
				}
			}
			api.addTokens(tokens, bals);
			return api.getBalances();
		},
	};
});

module.exports.misrepresentedTokens = true
