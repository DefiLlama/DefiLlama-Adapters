const ADDRESSES = require('./helper/coreAssets.json')
const { staking, stakings } = require('./helper/staking')

const wooPPConfig = {
	fantom: [
		ADDRESSES.fantom.WFTM, // WFTM
		'0x74b23882a30290451A17c44f4F05243b6b58C76d', // ETH
		'0x321162Cd933E2Be498Cd2267a90534A804051b11', // BTC
		'0x6626c47c00F1D87902fc13EECfaC3ed06D5E8D8a', // WOO
		ADDRESSES.fantom.USDC, // USDC
		ADDRESSES.fantom.fUSDT,
	],
	bsc: [
		ADDRESSES.bsc.WBNB, // WBNB
		ADDRESSES.bsc.ETH, // ETH
		ADDRESSES.bsc.BTCB, // BTC
		'0x4691937a7508860F876c9c0a2a617E7d9E945D4B', // WOO
		ADDRESSES.bsc.USDT, // USDT
		ADDRESSES.bsc.BUSD, // BUSD
	],
	avax: [
		ADDRESSES.avax.WAVAX, // WAVAX
		ADDRESSES.avax.WETH_e, // WETH.e
		ADDRESSES.avax.BTC_b, // BTC.b
		'0xaBC9547B534519fF73921b1FBA6E672b5f58D083', // WOO.e
		ADDRESSES.avax.USDC, // USDC
		ADDRESSES.avax.USDt,
	],
	polygon: [
		ADDRESSES.polygon.WMATIC_2, // WMATIC
		ADDRESSES.polygon.WETH_1, // WETH
		ADDRESSES.polygon.WBTC, // WBTC
		'0x1B815d120B3eF02039Ee11dC2d33DE7aA4a8C603', // WOO
		ADDRESSES.polygon.USDC, // USDC
		ADDRESSES.polygon.USDT,
	],
	arbitrum: [
		ADDRESSES.arbitrum.WETH, // WETH
		ADDRESSES.arbitrum.WBTC, // WBTC
		'0xcAFcD85D8ca7Ad1e1C6F82F651fA15E33AEfD07b', // WOO
		'0x912CE59144191C1204E64559FE8253a0e49E6548', // ARB
		ADDRESSES.arbitrum.USDC, // USDC
		'0xaf88d065e77c8cC2239327C5EDb3A432268e5831', // native USDC
		ADDRESSES.arbitrum.USDT,
	],
	optimism: [
		ADDRESSES.tombchain.FTM, // WETH
		'0x68f180fcCe6836688e9084f035309E29Bf0A2095', // WBTC
		ADDRESSES.optimism.OP, // OP
		ADDRESSES.optimism.USDC, // USDC
		ADDRESSES.optimism.USDT,
		'0x871f2F2ff935FD1eD867842FF2a7bfD051A5E527', // WOO
	],
	ethereum: [],
	era: [
		ADDRESSES.era.WETH, // WETH
		ADDRESSES.era.USDC, // USDC
	],
	polygon_zkevm: [
		ADDRESSES.polygon_zkevm.WETH,
		ADDRESSES.polygon_zkevm.USDC,
	],
}

const chainConfig = {
	fantom: {
		wooPPContract: '0x286ab107c5E9083dBed35A2B5fb0242538F4f9bf',
		woo: '0x6626c47c00f1d87902fc13eecfac3ed06d5e8d8a',
		stakingContract: '0x2Fe5E5D341cFFa606a5d9DA1B6B646a381B0f7ec',
		stakingContractV2: '0x1416E1378682b5Ca53F76656549f7570ad0703d9',
	},
	bsc: {
		wooPPContract: '0x59dE3B49314Bf5067719364A2Cb43e8525ab93FA',
		woo: '0x4691937a7508860f876c9c0a2a617e7d9e945d4b',
		stakingContract: '0x2AEab1a338bCB1758f71BD5aF40637cEE2085076',
		stakingContractV2: '0xba91ffD8a2B9F68231eCA6aF51623B3433A89b13',
	},
	avax: {
		wooPPContract: '0x3b3E4b4741e91aF52d0e9ad8660573E951c88524',
		woo: '0xabc9547b534519ff73921b1fba6e672b5f58d083',
		stakingContract: '0xcd1B9810872aeC66d450c761E93638FB9FE09DB0',
		stakingContractV2: '0x3Bd96847C40De8b0F20dA32568BD15462C1386E3',
	},
	polygon: {
		wooPPContract: '0x7081A38158BD050Ae4a86e38E0225Bc281887d7E',
		woo: '0x1b815d120b3ef02039ee11dc2d33de7aa4a8c603',
		stakingContract: '0x9BCf8b0B62F220f3900e2dc42dEB85C3f79b405B',
		stakingContractV2: '0xba91ffD8a2B9F68231eCA6aF51623B3433A89b13',
	},
	arbitrum: {
		wooPPContract: '0xeFF23B4bE1091b53205E35f3AfCD9C7182bf3062',
		woo: '0xcafcd85d8ca7ad1e1c6f82f651fa15e33aefd07b',
		stakingContract: '0x9321785D257b3f0eF7Ff75436a87141C683DC99d',
		stakingContractV2: '0x2CFa72E7f58dc82B990529450Ffa83791db7d8e2',
	},
	optimism: {
		wooPPContract: '0xd1778F9DF3eee5473A9640f13682e3846f61fEbC',
		woo: '0x871f2f2ff935fd1ed867842ff2a7bfd051a5e527',
		stakingContract: null,
		stakingContractV2: '0xba91ffD8a2B9F68231eCA6aF51623B3433A89b13',
	},
	ethereum: {
		wooPPContract: null,
		woo: '0x4691937a7508860F876c9c0a2a617E7d9E945D4B',
		stakingContract: null,
		stakingContractV2: '0xba91ffD8a2B9F68231eCA6aF51623B3433A89b13',
	},
	era: {
		wooPPContract: '0x42ED123EB5266A5B8E2B54B2C76180CCF5e72FEe',
		woo: null,
		stakingContract: null,
		stakingContractV2: null,
	},
	polygon_zkevm: {
		wooPPContract: '0xF5d215d9C84778F85746D15762DaF39B9E83a2d6',
		woo: null,
		stakingContract: null,
		stakingContractV2: null,
	},
}

Object.keys(chainConfig).forEach(chain => {
	const wooPPTokens = wooPPConfig[chain]
	const { wooPPContract, woo, stakingContract, stakingContractV2 } = chainConfig[chain]

	var tvl = 0
	if (wooPPContract != null) {
		tvl = staking(wooPPContract, wooPPTokens, chain)
	}

	var contracts = []
	if (stakingContract != null) {
		contracts.push(stakingContract)
	}
	if (stakingContractV2 != null) {
		contracts.push(stakingContractV2)
	}

	var stakingAmount = 0
	if (woo != null) {
		stakingAmount = stakings(contracts, woo, chain)
	}

	module.exports[chain] = {
		staking: stakingAmount,
		tvl: tvl,
	}
})
