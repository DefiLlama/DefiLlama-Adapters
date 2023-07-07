const { nullAddress } = require("../helper/tokenMapping");

const COLLECTIF_LIQUID_STAKING_POOL_CONTRACT = "0xd0437765D1Dc0e2fA14E97d290F135eFdf1a8a9A"; // pool address
const totalAssetsABI = "function totalAssets() public view returns (uint256)";

module.exports = {
	methodology:
		"Collectif DAO is a non-custodial liquid staking protocol on Filecoin. It allows users stake FIL tokens to the pool and get back clFIL token, which is a native yield bearing liquid staking asset on Filecoin. This TVL calculation returns total amount of assets backing clFIL, that includes buffered capital in the pool and pledged capital to the Filecoin Storage Providers (miners)",
	filecoin: {
		tvl: async (_, _1, _2, { api }) => {
			const totalAssets = await api.call({ abi: totalAssetsABI, target: COLLECTIF_LIQUID_STAKING_POOL_CONTRACT });
			
			const tvl = totalAssets.toString();

			api.add(nullAddress, tvl)
		},
	},
};
