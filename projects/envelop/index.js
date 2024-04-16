
const { sumTokensExport } = require("../helper/unwrapLPs");
const ADDRESSES = require('../helper/coreAssets.json');
const { staking } = require('../helper/staking')

module.exports = {
	methodology: 'TVL is the collateral coins, tokens, NFTs wrapped in Envelop vaults.',
	hallmarks: [
		[1709667755, "Blast Mainnet deployment"],
		[1634745600, "Envelop(NIFTSY) TGE"],
	],
}
const config = {
	ethereum: {
		protocolContracts: [
			// '0x9843242eC39387f2A0be49a0E90B4117f5016f1c',
			// '0xE0E4EC54ed883d7089895C0e951b4bB8E3c68e9d',
			// '0xE77b3F1F7BD06A86a53563e69Bb49cE6bab1C2bB',
			// '', // Farming
			// '0x4746b30e21be31aa65a31adfb1ad476f4f9639c1', // IDO LOcker
			'0x765886A9f388ca58092Bba5b6191b1e57e0950Bf', // protocol
			'0x53c55bB901812551aa36cbf022B5df35B24C9f59', // protocol
			'0x2C72097760B3f0E781C9499dD94486E46DFD664C', // protocol
		],
		farming: ['0xD5E1cDfCf6A9fdc68997a90E8B5ee962e536a0D8'],
		NIFTSY: '0x7728cd70b3dD86210e2bd321437F448231B81733',
		tokens: [
			ADDRESSES.null,
			ADDRESSES.ethereum.DAI,
			ADDRESSES.ethereum.USDT,
			ADDRESSES.ethereum.USDC,
			ADDRESSES.ethereum.WETH,
			// '0x7728cd70b3dD86210e2bd321437F448231B81733', // NIFTSY
		]
	},
	bsc: {
		protocolContracts: [
			// "0x96A25076b3c1707cB057551D8C4D49480AcC5334",
			// "0x721d86E0027c1c9E128c4f935AD80fBc921A9021",
			"0x2E2F00Dfac24C4cCB9c7cCACacFc066bAa2938f5", // Protocol
			// "0xD5E1cDfCf6A9fdc68997a90E8B5ee962e536a0D8", // Farming
			"0xF81356B101A52cf62BBe1E34353a139934dE4c17", // Protocol
			"0x4a80d07a1e8c15069c397cf34c407a627dcb8487", // Protocol
			"0x0a18Abe3030C9E766329b9b9A05d2D9bD03C4F8F", // Protocol
			'0x98CADa78CFE0BCf17BF9aD96dA4B824C96c9d837',
		],
		farming: ['0xD5E1cDfCf6A9fdc68997a90E8B5ee962e536a0D8'],
		NIFTSY: '0x7728cd70b3dD86210e2bd321437F448231B81733',
		tokens: [
			ADDRESSES.null,
			ADDRESSES.bsc.USDT,
			ADDRESSES.bsc.USDC,
			ADDRESSES.bsc.BUSD,
			'0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3', // DAI
			// '0x7728cd70b3dD86210e2bd321437F448231B81733', // NIFTSY
		]
	},
	polygon: {
		protocolContracts: [
			// "0x6223b7ac40Da9EaD7486CeA5352034a3a2517e56",
			// "0xDC1Aa8D625ab092fEd8Dc5879348dD77700Ceec6",
			"0x4640024F4e00De23211ca505f3021d460c01a2a8", // Protocol
			// "0xD5E1cDfCf6A9fdc68997a90E8B5ee962e536a0D8", // Farming
			"0xFcE14427Eb7e5df0c5313249b19B56b81633Df8A", // Protocol
			"0x018Ab23bae3eD9Ec598B1239f37B998fEDB75af3", // Protocol,
			"0xc2571eBbc8F2af4f832bB8a2D3A4b0932Ce24773",
		],
		farming: ['0xD5E1cDfCf6A9fdc68997a90E8B5ee962e536a0D8'],
		NIFTSY: '0x432cdbC749FD96AA35e1dC27765b23fDCc8F5cf1',
		tokens: [
			ADDRESSES.null,
			ADDRESSES.polygon.DAI,
			ADDRESSES.polygon.USDT,
			ADDRESSES.polygon.USDC,
			ADDRESSES.polygon.WETH_1,
			// '0x432cdbC749FD96AA35e1dC27765b23fDCc8F5cf1', // NIFTSY
		]
	},
	arbitrum: {
		protocolContracts: [
			// '0x5bECBAD9784e1b370AE34a154084F3e7a52f6cEe',
			// '0x85DC0Ed956c15cB40580712693033e36385204A3',
			'0x6664c8118284b3F5ECB47c2105cAa544Ab0Cf75B',
		],
		tokens: [
			ADDRESSES.null,
			'0x6ab707Aca953eDAeFBc4fD23bA73294241490620', // Aave Arbitrum USDT (aArbUSDT)
		]
	},
	optimism: {
		protocolContracts: [
			// '0x5515aEF68f62a6f819BD7E1b86AE9d9a2bfE794B',
		],
		tokens: [
			ADDRESSES.null,
		]
	},
	avax: {
		protocolContracts: [
			'0xc2571eBbc8F2af4f832bB8a2D3A4b0932Ce24773',
		],
		tokens: [
			ADDRESSES.null,
		]
	},
	blast: {
		protocolContracts: [
			'0xd3807CE2F215DC42ca4bfA616B16C20b0B195128',
			'0x2333615f43f898cD4368513fa59b0fDcF945f492',
		],
		tokens: [
			ADDRESSES.null,
			ADDRESSES.blast.USDB,
			ADDRESSES.blast.WETH
		]
	}
}

Object.keys(config).forEach(chain => {
	const { protocolContracts: owners, tokens, NIFTSY, farming, } = config[chain]
	module.exports[chain] = { tvl: sumTokensExport({ owners, tokens, }) }
	if (NIFTSY) module.exports[chain].staking = staking(farming, NIFTSY)
})
