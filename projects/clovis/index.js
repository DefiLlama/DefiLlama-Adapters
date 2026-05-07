const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs');
const abi = require('../helper/abis/aave.json');

const VAULT_ADDRESS = '0x39166b36A25a4A98D6B7C21d429f4740C6A5e94C';

const VAULTS = {
	ethereum: [VAULT_ADDRESS],
	arbitrum: [VAULT_ADDRESS],
	optimism: [VAULT_ADDRESS],
	polygon: [VAULT_ADDRESS],
	base: [VAULT_ADDRESS],
	bsc: [VAULT_ADDRESS],
	sei: [VAULT_ADDRESS],
	hyperliquid: [VAULT_ADDRESS],
	avax: [VAULT_ADDRESS],
	swellchain: [VAULT_ADDRESS],
};

const WRAPPERS = {
	sei: [
		'0x809FF4801aA5bDb33045d1fEC810D082490D63a4', // aYeiSEI
		'0x093066736E6762210de13F92b39Cf862eee32819', // aYeiWETH
		'0x817B3C191092694C65f25B4d38D4935a8aB65616', // aYeiNativeUSDC
		'0x368A466cD8679197a08a3F6318B6a5b67df81fb0', // aYeiUSDT0
		'0xB6298BCD7EC6CA2A6EaBdD84A88969091b2c3291', // aYeiBTC
	],
};

const TOKENS = {
	ethereum: [
		ADDRESSES.ethereum.WBTC, // WBTC
		ADDRESSES.ethereum.WETH, // WETH
		ADDRESSES.ethereum.USDC, // USDC
		ADDRESSES.ethereum.USDT, // USDT
	],
	optimism: [
		ADDRESSES.optimism.USDC_CIRCLE, // USDC
		'0x01bFF41798a0BcF287b996046Ca68b395DbC1071', // USD₮0
		ADDRESSES.optimism.WETH_1, // WETH
		ADDRESSES.optimism.WBTC, // WBTC
	],
	bsc: [
		ADDRESSES.bsc.USDC, // USDC
		ADDRESSES.bsc.USDT, // USDT
		ADDRESSES.bsc.ETH, // ETH
		ADDRESSES.bsc.WBTC, // WBTC
	],
	polygon: [
		ADDRESSES.polygon.USDC_CIRCLE, // USDC
		ADDRESSES.polygon.USDT, // USDT
		ADDRESSES.polygon.WETH_1, // WETH
		ADDRESSES.polygon.WBTC, // WBTC
	],
	hyperliquid: [
		'0x9ab96A4668456896d45c301Bc3A15Cee76AA7B8D', // rUSDC
		ADDRESSES.corn.USDT0, // USD₮0
	],
	base: [
		ADDRESSES.base.USDC, // USDC
		ADDRESSES.base.USDT, // USDT
		ADDRESSES.optimism.WETH_1, // WETH
		ADDRESSES.bsc.WBTC, // WBTC
	],
	arbitrum: [
		ADDRESSES.arbitrum.USDC_CIRCLE, // USDC
		ADDRESSES.arbitrum.USDT, // USD₮0
		ADDRESSES.arbitrum.WETH, // WETH
		ADDRESSES.arbitrum.WBTC, // WBTC
	],
	avax: [
		ADDRESSES.avax.USDC, // USDC
		ADDRESSES.avax.USDt, // USDt
		ADDRESSES.avax.WETH_e, // WETH.e
		ADDRESSES.avax.WBTC_e, // WBTC.e
	],
	swellchain: [
		'0x9ab96A4668456896d45c301Bc3A15Cee76AA7B8D', // rUSDC
		'0x102d758f688a4C1C5a80b116bD945d4455460282', // USD₮0
		ADDRESSES.optimism.WETH_1, // WETH
	],
};

async function tvl(api) {
	const owners = VAULTS[api.chain] || [];
	const wrappers = WRAPPERS[api.chain] || [];
	const tokens = TOKENS[api.chain] || [];

	// Handle wrapped tokens
	const underlyings = await api.multiCall({
		abi: abi.getUnderlying,
		calls: wrappers,
		permitFailure: true,
	});
	const calls = wrappers.flatMap((wrapper, i) =>
		owners.map(owner => ({ target: wrapper, params: owner, underlying: underlyings[i] }))
	);
	const underlyingBalances = await api.multiCall({
		abi: 'erc20:balanceOf',
		calls: calls.map(call => ({ target: call.target, params: call.params })),
		permitFailure: true,
	});
	api.add(underlyings, underlyingBalances)

	// Handle direct tokens
	const tokenBalances = await api.multiCall({
		abi: 'erc20:balanceOf',
		calls: tokens.flatMap((token) =>
			owners.map(owner => ({ target: token, params: owner }))
		),
	});
	api.add(tokens, tokenBalances);

	return sumTokens2({ api, owners, resolveLP: true });
}

module.exports = {
	ethereum: { tvl },
	arbitrum: { tvl },
	optimism: { tvl },
	polygon: { tvl },
	base: { tvl },
	bsc: { tvl },
	sei: { tvl },
	hyperliquid: { tvl },
	avax: { tvl },
	swellchain: { tvl },
};