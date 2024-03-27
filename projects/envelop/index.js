
const { sumTokensExport } = require("../helper/unwrapLPs");
const ADDRESSES = require('../helper/coreAssets.json');

const ethereum = {
	protocolContracts: [
		'0x9843242eC39387f2A0be49a0E90B4117f5016f1c',
		'0xE0E4EC54ed883d7089895C0e951b4bB8E3c68e9d',
		'0xE77b3F1F7BD06A86a53563e69Bb49cE6bab1C2bB',
		'0xD5E1cDfCf6A9fdc68997a90E8B5ee962e536a0D8', // Farming
		'0x4746b30e21be31aa65a31adfb1ad476f4f9639c1', // IDO LOcker
		'0x765886A9f388ca58092Bba5b6191b1e57e0950Bf', // protocol
		'0x53c55bB901812551aa36cbf022B5df35B24C9f59', // protocol
		'0x2C72097760B3f0E781C9499dD94486E46DFD664C', // protocol
	],
	tokensToCheck: [
		ADDRESSES.null,
		ADDRESSES.ethereum.DAI,  // 0x6b175474e89094c44da98b954eedeac495271d0f
		ADDRESSES.ethereum.USDT, // 0xdAC17F958D2ee523a2206206994597C13D831ec7
		ADDRESSES.ethereum.USDC, // 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48
		ADDRESSES.ethereum.WETH, // 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2
		'0x7728cd70b3dD86210e2bd321437F448231B81733', // NIFTSY
	]
}

const bsc = {
	protocolContracts: [
		"0x96A25076b3c1707cB057551D8C4D49480AcC5334",
		"0x721d86E0027c1c9E128c4f935AD80fBc921A9021",
		"0x2E2F00Dfac24C4cCB9c7cCACacFc066bAa2938f5", // Protocol
		"0xD5E1cDfCf6A9fdc68997a90E8B5ee962e536a0D8", // Farming
		"0xF81356B101A52cf62BBe1E34353a139934dE4c17", // Protocol
		"0x4a80d07a1e8c15069c397cf34c407a627dcb8487", // Protocol
		"0x0a18Abe3030C9E766329b9b9A05d2D9bD03C4F8F", // Protocol
	],
	tokensToCheck: [
		ADDRESSES.null,
		ADDRESSES.bsc.USDT, // 0x55d398326f99059fF775485246999027B3197955
		ADDRESSES.bsc.USDC, // 0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d
		ADDRESSES.bsc.BUSD, // 0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56
		'0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3', // DAI
		'0x7728cd70b3dD86210e2bd321437F448231B81733', // NIFTSY
	]
}
const polygon = {
	protocolContracts: [
		"0x6223b7ac40Da9EaD7486CeA5352034a3a2517e56",
		"0xDC1Aa8D625ab092fEd8Dc5879348dD77700Ceec6",
		"0x4640024F4e00De23211ca505f3021d460c01a2a8", // Protocol
		"0xD5E1cDfCf6A9fdc68997a90E8B5ee962e536a0D8", // Farming
		"0xFcE14427Eb7e5df0c5313249b19B56b81633Df8A", // Protocol
		"0x018Ab23bae3eD9Ec598B1239f37B998fEDB75af3", // Protocol
	],
	tokensToCheck: [
		ADDRESSES.null,
		ADDRESSES.polygon.DAI, // 0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063
		ADDRESSES.polygon.USDT, // 0xc2132D05D31c914a87C6611C10748AEb04B58e8F
		ADDRESSES.polygon.USDC, // 0x2791bca1f2de4661ed88a30c99a7a9449aa84174
		ADDRESSES.polygon.WETH_1, // 0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619
		'0x432cdbC749FD96AA35e1dC27765b23fDCc8F5cf1', // NIFTSY
	]
}
const arbitrum = {
	protocolContracts: [
		'0x5bECBAD9784e1b370AE34a154084F3e7a52f6cEe',
		'0x85DC0Ed956c15cB40580712693033e36385204A3',
	],
	tokensToCheck: [
		ADDRESSES.null,
		'0x6ab707Aca953eDAeFBc4fD23bA73294241490620', // Aave Arbitrum USDT (aArbUSDT)
	]
}
const optimism = {
	protocolContracts: [
		'0x5515aEF68f62a6f819BD7E1b86AE9d9a2bfE794B',
	],
	tokensToCheck: [
		ADDRESSES.null,
	]
}
const avax = {
	protocolContracts: [
		'0xc2571eBbc8F2af4f832bB8a2D3A4b0932Ce24773',
	],
	tokensToCheck: [
		ADDRESSES.null,
	]
}
const blast = {
	protocolContracts: [
		'0xd3807CE2F215DC42ca4bfA616B16C20b0B195128'
	],
	tokensToCheck: [
		ADDRESSES.null,
		ADDRESSES.blast.USDB,
		ADDRESSES.blast.WETH
	]
}

module.exports = {
	hallmarks: [
		[1709667755, "Blast Mainnet deployment"],
		[1708704000, "Aptos Mainnet deployment"],
		[1701705600, "Zilliqa Mainnet deployment"],
		[1677254400, "Wax Mainnet deployment"],
		[1654531200, "Polygon Mainnet deployment"],
		[1637596800, "Avalanche Mainnet deployment"],
		[1633795200, "Binance Mainnet deployment"],
	],
	methodology: 'TVL is the collateral coins, tokens, NFTs wrapped in Envelop vaults.',
	start: 0,
	ethereum: {
		tvl: sumTokensExport({
			owners: ethereum.protocolContracts,
			tokens: ethereum.tokensToCheck,
		}),
	},
	bsc: {
		tvl: sumTokensExport({
			owners: bsc.protocolContracts,
			tokens: bsc.tokensToCheck,
		}),
	},
	polygon: {
		tvl: sumTokensExport({
			owners: polygon.protocolContracts,
			tokens: polygon.tokensToCheck,
		}),
	},
	arbitrum: {
		tvl: sumTokensExport({
			owners: arbitrum.protocolContracts,
			tokens: arbitrum.tokensToCheck,
		}),
	},
	optimism: {
		tvl: sumTokensExport({
			owners: optimism.protocolContracts,
			tokens: optimism.tokensToCheck,
		}),
	},
	avax: {
		tvl: sumTokensExport({
			owners: avax.protocolContracts,
			tokens: avax.tokensToCheck,
		}),
	},
	blast: {
		tvl: sumTokensExport({
			owners: blast.protocolContracts,
			tokens: blast.tokensToCheck,
		}),
	},
};