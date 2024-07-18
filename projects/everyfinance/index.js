// BSC
const BSC_ALPHA_TOKEN = "0x53ca73EE747ceD027c677feCCC13b885f31Ee4dF";
const BSC_ALPHA_MANAGEMENT = "0xbebbaE6f1062E4Cd5652B9d8e1B8aECBEE993A9E";
const BSC_BETA_TOKEN = "0x9C1A18A734dFAe6e6f89942f358e7270BecdB002";
const BSC_BETA_MANAGEMENT = "0x19d6D19a034BB886507DC08dF99716f418bD61a3";
const BSC_GAMMA_TOKEN = "0xb2d66C5ECcde53e94019556138Cbf41700E5c49E";
const BSC_GAMMA_MANAGEMENT = "0x8849FCE3fB3d82BBF14e1FC9D7E82EAfEB4b2904";
const BSC_STABLECOIN = "0x55d398326f99059fF775485246999027B3197955";
// Polygon
const POLYGON_ALPHA_TOKEN = "0xF0aD135A657808a3E576183Eb647872d901CFF02";
const POLYGON_ALPHA_MANAGEMENT = "0x8849FCE3fB3d82BBF14e1FC9D7E82EAfEB4b2904";
const POLYGON_BETA_TOKEN = "0x0f20180e0F84a8cc4A4821eC24E7d9a9b70ED1A8";
const POLYGON_BETA_MANAGEMENT = "0xbE49a740c48F9D4347De8994c488333d492a4e19";
const POLYGON_GAMMA_TOKEN = "0x64B41253C0B4fCa4885c3dc24B7562A3B02C02Cc";
const POLYGON_GAMMA_MANAGEMENT = "0x9C1A18A734dFAe6e6f89942f358e7270BecdB002";
const POLYGON_STABLECOIN = "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359";
// Ethereum
const ETHEREUM_ALPHA_TOKEN = "0x8D769F45c94CEA310018d37BD06fc42e7DB060FF";
const ETHEREUM_ALPHA_MANAGEMENT = "0xbebbaE6f1062E4Cd5652B9d8e1B8aECBEE993A9E";
const ETHEREUM_BETA_TOKEN = "0x9C1A18A734dFAe6e6f89942f358e7270BecdB002";
const ETHEREUM_BETA_MANAGEMENT = "0x19d6D19a034BB886507DC08dF99716f418bD61a3";
const ETHEREUM_GAMMA_TOKEN = "0xbE49a740c48F9D4347De8994c488333d492a4e19";
const ETHEREUM_GAMMA_MANAGEMENT = "0xbE721812442C648c191Bc267659374036fd68918";
const ETHEREUM_STABLECOIN = "0xdAC17F958D2ee523a2206206994597C13D831ec7";

const managementPriceAbi = {
	inputs: [],
	name: "getTokenPrice",
	outputs: [
		{
			components: [
				{
					internalType: "uint256",
					name: "value",
					type: "uint256",
				},
				{
					internalType: "uint256",
					name: "time",
					type: "uint256",
				},
			],
			internalType: "struct Management.Price",
			name: "",
			type: "tuple",
		},
	],
	stateMutability: "view",
	type: "function",
};

const scalingFactorAbi = {
	inputs: [],
	name: "SCALING_FACTOR",
	outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
	stateMutability: "view",
	type: "function",
};

async function tvl(api, chain) {
	const {
		alphaContract,
		alphaManagement,
		betaContract,
		betaManagement,
		gammaContract,
		gammaManagement,
		stableCoin,
	} = (() => {
		switch (chain) {
			case "bsc":
				return {
					alphaContract: BSC_ALPHA_TOKEN,
					alphaManagement: BSC_ALPHA_MANAGEMENT,
					betaContract: BSC_BETA_TOKEN,
					betaManagement: BSC_BETA_MANAGEMENT,
					gammaContract: BSC_GAMMA_TOKEN,
					gammaManagement: BSC_GAMMA_MANAGEMENT,
					stableCoin: BSC_STABLECOIN,
				};
			case "polygon":
				return {
					alphaContract: POLYGON_ALPHA_TOKEN,
					alphaManagement: POLYGON_ALPHA_MANAGEMENT,
					betaContract: POLYGON_BETA_TOKEN,
					betaManagement: POLYGON_BETA_MANAGEMENT,
					gammaContract: POLYGON_GAMMA_TOKEN,
					gammaManagement: POLYGON_GAMMA_MANAGEMENT,
					stableCoin: POLYGON_STABLECOIN,
				};
			case "ethereum":
				return {
					alphaContract: ETHEREUM_ALPHA_TOKEN,
					alphaManagement: ETHEREUM_ALPHA_MANAGEMENT,
					betaContract: ETHEREUM_BETA_TOKEN,
					betaManagement: ETHEREUM_BETA_MANAGEMENT,
					gammaContract: ETHEREUM_GAMMA_TOKEN,
					gammaManagement: ETHEREUM_GAMMA_MANAGEMENT,
					stableCoin: ETHEREUM_STABLECOIN,
				};
			default:
				throw new Error(`Unsupported chain ${chain}`);
		}
	})();

	const stableCoinDecimals = await api.call({
		abi: "erc20:decimals",
		target: stableCoin,
		params: [],
	});

	// Alpha calculations
	const alphaBalance = await api.call({
		abi: "erc20:totalSupply",
		target: alphaContract,
		params: [],
	});

	const alphaPrice = await api.call({
		abi: managementPriceAbi,
		target: alphaManagement,
		params: [],
	});

	const scalingFactorAlpha = await api.call({
		abi: scalingFactorAbi,
		target: alphaManagement,
		params: [],
	});

	api.add(
		stableCoin,
		(alphaBalance * alphaPrice[0]) /
			(scalingFactorAlpha * 10 ** (18 - stableCoinDecimals)),
	);

	// Beta calculations
	const betaBalance = await api.call({
		abi: "erc20:totalSupply",
		target: betaContract,
		params: [],
	});

	const betaPrice = await api.call({
		abi: managementPriceAbi,
		target: betaManagement,
		params: [],
	});

	const scalingFactorBeta = await api.call({
		abi: scalingFactorAbi,
		target: betaManagement,
		params: [],
	});

	api.add(
		stableCoin,
		(betaBalance * betaPrice[0]) /
			(scalingFactorBeta * 10 ** (18 - stableCoinDecimals)),
	);

	// Gamma calculations
	const gammaBalance = await api.call({
		abi: "erc20:totalSupply",
		target: gammaContract,
		params: [],
	});

	const gammaPrice = await api.call({
		abi: managementPriceAbi,
		target: gammaManagement,
		params: [],
	});

	const scalingFactorGamma = await api.call({
		abi: scalingFactorAbi,
		target: gammaManagement,
		params: [],
	});

	api.add(
		stableCoin,
		(gammaBalance * gammaPrice[0]) /
			(scalingFactorGamma * 10 ** (18 - stableCoinDecimals)),
	);
}

module.exports = {
	methodology:
		"Calculates the total value locked by using the total supply of the ALPHA, BETA, and GAMMA tokens.",
	start: 1000235,
	bsc: {
		tvl: (api) => tvl(api, "bsc"),
	},
	polygon: {
		tvl: (api) => tvl(api, "polygon"),
	},
	ethereum: {
		tvl: (api) => tvl(api, "ethereum"),
	},
};
