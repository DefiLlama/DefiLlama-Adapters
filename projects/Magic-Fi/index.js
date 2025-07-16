const ADDRESSES = require('../helper/coreAssets.json')
const { staking, stakings } = require('../helper/staking')

const magicPPConfig = {
	fantom: [
		ADDRESSES.fantom.WFTM, // WFTM
		'0x74b23882a30290451A17c44f4F05243b6b58C76d', // WETH
		'0x321162Cd933E2Be498Cd2267a90534A804051b11', // WBTC
		'0x6626c47c00F1D87902fc13EECfaC3ed06D5E8D8a', // magic
		ADDRESSES.fantom.USDC, // USDC
		ADDRESSES.fantom.fUSDT, // fUSDT
	],
	bsc: [
		ADDRESSES.bsc.WBNB, // WBNB
		ADDRESSES.bsc.ETH, // ETH
		ADDRESSES.bsc.BTCB, // BTCB
		'0x4691937a7508860F876c9c0a2a617E7d9E945D4B', // magic
		ADDRESSES.bsc.USDT, // USDT
		ADDRESSES.bsc.BUSD, // BUSD
		'0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82', // CAKE
	],
	avax: [
		ADDRESSES.avax.WAVAX, // WAVAX
		ADDRESSES.avax.WETH_e, // WETH.e
		ADDRESSES.avax.BTC_b, // BTC.b
		'0xaBC9547B534519fF73921b1FBA6E672b5f58D083', // magic.e
		ADDRESSES.avax.USDC, // USDC
		ADDRESSES.avax.USDt, // USDt
	],
	polygon: [
		ADDRESSES.polygon.WMATIC_2, // WMATIC
		ADDRESSES.polygon.WETH_1, // WETH
		ADDRESSES.polygon.WBTC, // WBTC
		'0x1B815d120B3eF02039Ee11dC2d33DE7aA4a8C603', // magic
		ADDRESSES.polygon.USDC, // USDC.e
		ADDRESSES.polygon.USDC_CIRCLE, // native USDC
		ADDRESSES.polygon.USDT, // USDT
	],
	arbitrum: [
		ADDRESSES.arbitrum.WETH, // WETH
		ADDRESSES.arbitrum.WBTC, // WBTC
		'0xcAFcD85D8ca7Ad1e1C6F82F651fA15E33AEfD07b', // magic
		ADDRESSES.arbitrum.ARB, // ARB
		ADDRESSES.arbitrum.USDC, // USDC.e
		ADDRESSES.arbitrum.USDC_CIRCLE, // native USDC
		ADDRESSES.arbitrum.USDT, // USDT
	],
	optimism: [
		ADDRESSES.optimism.WETH_1, // WETH
		ADDRESSES.optimism.WBTC, // WBTC
		ADDRESSES.optimism.OP, // OP
		ADDRESSES.optimism.USDC, // USDC.e
		ADDRESSES.optimism.USDC_CIRCLE, // native USDC
		ADDRESSES.optimism.USDT, // USDT
		'0x871f2F2ff935FD1eD867842FF2a7bfD051A5E527', // magic
	],
	ethereum: [],
	era: [
		ADDRESSES.era.WETH, // WETH
		ADDRESSES.era.ZK, // ZK
		ADDRESSES.era.USDC, // USDC.e
		'0x1d17CBcF0D6D143135aE902365D2E5e2A16538D4', // native USDC
	],
	polygon_zkevm: [
		ADDRESSES.polygon_zkevm.WETH, // WETH
		ADDRESSES.polygon_zkevm.USDC, // USDC
	],
	linea: [
		ADDRESSES.linea.WETH, // WETH
		'0x3aAB2285ddcDdaD8edf438C1bAB47e1a9D05a9b4', // WBTC
		ADDRESSES.linea.USDC, // native USDC
		ADDRESSES.linea.USDT, // USDT
	],
	base: [
		ADDRESSES.base.WETH, // WETH
		ADDRESSES.ethereum.cbBTC, // cbBTC
		ADDRESSES.base.USDbC, // USDbC
		ADDRESSES.base.USDC, // native USDC
	],
	mantle: [
		ADDRESSES.mantle.WMNT, // WMNT
		ADDRESSES.mantle.WETH, // WETH
		ADDRESSES.mantle.mETH, // mETH
		ADDRESSES.mantle.USDT, // USDT
		ADDRESSES.mantle.USDC, // USDC
		ADDRESSES.mantle.cmETH, // cmETH
	],
	sonic: [
		ADDRESSES.sonic.wS, //wS
		'0x50c42dEAcD8Fc9773493ED674b675bE577f2634b', // WETH
		ADDRESSES.sonic.USDC_e, // USDC.e
	],
}

const chainConfig = {
	fantom: {
		magicPPContract: '0x286ab107c5E9083dBed35A2B5fb0242538F4f9bf',
		magic: '0x6626c47c00f1d87902fc13eecfac3ed06d5e8d8a',
		stakingContract: '0x2Fe5E5D341cFFa606a5d9DA1B6B646a381B0f7ec',
		stakingContractV2: '0x1416E1378682b5Ca53F76656549f7570ad0703d9',
	},
	bsc: {
		magicPPContract: '0xEd9e3f98bBed560e66B89AaC922E29D4596A9642',
		magic: '0x4691937a7508860f876c9c0a2a617e7d9e945d4b',
		stakingContract: '0x2AEab1a338bCB1758f71BD5aF40637cEE2085076',
		stakingContractV2: '0xba91ffD8a2B9F68231eCA6aF51623B3433A89b13',
	},
	avax: {
		magicPPContract: '0xEd9e3f98bBed560e66B89AaC922E29D4596A9642',
		magic: '0xabc9547b534519ff73921b1fba6e672b5f58d083',
		stakingContract: '0xcd1B9810872aeC66d450c761E93638FB9FE09DB0',
		stakingContractV2: '0x3Bd96847C40De8b0F20dA32568BD15462C1386E3',
	},
	polygon: {
		magicPPContract: '0xEd9e3f98bBed560e66B89AaC922E29D4596A9642',
		magic: '0x1b815d120b3ef02039ee11dc2d33de7aa4a8c603',
		stakingContract: '0x9BCf8b0B62F220f3900e2dc42dEB85C3f79b405B',
		stakingContractV2: '0xba91ffD8a2B9F68231eCA6aF51623B3433A89b13',
	},
	arbitrum: {
		magicPPContract: '0xEd9e3f98bBed560e66B89AaC922E29D4596A9642',
		magic: '0xcafcd85d8ca7ad1e1c6f82f651fa15e33aefd07b',
		stakingContract: '0x9321785D257b3f0eF7Ff75436a87141C683DC99d',
		stakingContractV2: '0x2CFa72E7f58dc82B990529450Ffa83791db7d8e2',
	},
	optimism: {
		magicPPContract: '0xEd9e3f98bBed560e66B89AaC922E29D4596A9642',
		magic: '0x871f2f2ff935fd1ed867842ff2a7bfd051a5e527',
		stakingContract: null,
		stakingContractV2: '0xba91ffD8a2B9F68231eCA6aF51623B3433A89b13',
	},
	ethereum: {
		magicPPContract: null,
		magic: '0x4691937a7508860F876c9c0a2a617E7d9E945D4B',
		stakingContract: null,
		stakingContractV2: '0xba91ffD8a2B9F68231eCA6aF51623B3433A89b13',
	},
	era: {
		magicPPContract: '0xE656d70bc3550e3EEE9dE7dC79367A44Fd13d975',
		magic: null,
		stakingContract: null,
		stakingContractV2: null,
	},
	polygon_zkevm: {
		magicPPContract: '0xF5d215d9C84778F85746D15762DaF39B9E83a2d6',
		magic: null,
		stakingContract: null,
		stakingContractV2: null,
	},
	linea: {
		magicPPContract: '0xEd9e3f98bBed560e66B89AaC922E29D4596A9642',
		magic: null,
		stakingContract: null,
		stakingContractV2: null,
	},
	base: {
		magicPPContract: '0xEd9e3f98bBed560e66B89AaC922E29D4596A9642',
		magic: null,
		stakingContract: null,
		stakingContractV2: null,
	},
	mantle: {
		magicPPContract: '0xEd9e3f98bBed560e66B89AaC922E29D4596A9642',
		magic: null,
		stakingContract: null,
		stakingContractV2: null,
	},
	sonic: {
		magicPPContract: '0xEd9e3f98bBed560e66B89AaC922E29D4596A9642',
		magic: null,
		stakingContract: null,
		stakingContractV2: null,
	}
}

Object.keys(chainConfig).forEach(chain => {
	const magicPPTokens = magicPPConfig[chain]
	const { magicPPContract, magic, stakingContract, stakingContractV2 } = chainConfig[chain]

	var tvl = 0
	if (magicPPContract != null) {
		tvl = staking(magicPPContract, magicPPTokens, chain)
	}

	var contracts = []
	if (stakingContract != null) {
		contracts.push(stakingContract)
	}
	if (stakingContractV2 != null) {
		contracts.push(stakingContractV2)
	}

	var stakingAmount = 0
	if (magic != null) {
		stakingAmount = stakings(contracts, magic, chain)
	}

	module.exports[chain] = {
		staking: stakingAmount,
		tvl: tvl,
	}
})
