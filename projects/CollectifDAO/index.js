const { nullAddress } = require("../helper/tokenMapping");
const { get } = require("../helper/http");
const { getConfig } = require("../helper/cache");

const COLLECTIF_LIQUID_STAKING_POOL_CONTRACT = "0xd0437765D1Dc0e2fA14E97d290F135eFdf1a8a9A"; // pool address
const COLLECTIF_SPS_COLLATERAL_CONTRACT = "0x3D52874772C66466c93E36cc3782946fd0FA7666";

const totalAssetsABI = "function totalAssets() public view returns (uint256)";
const getCollateralABI = "function getCollateral(uint64 _ownerId) public view returns (uint256, uint256)";

const getMinersOwners = async () => {
	const data = await get('https://app.collectif.finance/data/owners.json');
	return data.owners;
}

module.exports = {
	methodology:
		"Collectif DAO is a non-custodial liquid staking protocol on Filecoin. It allows users stake FIL tokens to the pool and get back clFIL token, which is a native yield bearing liquid staking asset on Filecoin. This TVL calculation returns total amount of assets backing clFIL, that includes buffered capital in the pool, pledged capital to the Filecoin Storage Providers (miners) and liquid FIL collateral provided by Storage Providers to cover potential slashing risks",
	filecoin: {
		tvl: async (_, _1, _2, { api }) => {
			const fetchCollateral = async (owner) => api.call({
				abi: getCollateralABI,
				target: COLLECTIF_SPS_COLLATERAL_CONTRACT,
				params: [owner.slice(2)]
			});

			const minersOwners = await getConfig('collectif-dao', undefined, { fetcher: getMinersOwners});
			const totalStaked = await api.call({ abi: totalAssetsABI, target: COLLECTIF_LIQUID_STAKING_POOL_CONTRACT });

			let totalCollateral = 0

			if (minersOwners && minersOwners.length > 0) {
				const collaterals = await Promise.all(minersOwners.map(fetchCollateral));
				totalCollateral = collaterals.reduce((acc, cur) => {
					const [available, locked] = cur;
					return acc + +available + +locked
				}, 0);
			}

			api.add(nullAddress, totalStaked)
			api.add(nullAddress, totalCollateral)
		},
	},
};
