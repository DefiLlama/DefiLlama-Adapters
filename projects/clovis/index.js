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
		'0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', // WBTC
		'0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
		'0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
		'0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
	],
	optimism: [
		'0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85', // USDC
		'0x01bFF41798a0BcF287b996046Ca68b395DbC1071', // USD₮0
		'0x4200000000000000000000000000000000000006', // WETH
		'0x68f180fcCe6836688e9084f035309E29Bf0A2095', // WBTC
	],
	bsc: [
		'0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', // USDC
		'0x55d398326f99059fF775485246999027B3197955', // USDT
		'0x2170Ed0880ac9A755fd29B2688956BD959F933F8', // ETH
		'0x0555E30da8f98308EdB960aa94C0Db47230d2B9c', // WBTC
	],
	polygon: [
		'0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359', // USDC
		'0xc2132D05D31c914a87C6611C10748AEb04B58e8F', // USDT
		'0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619', // WETH
		'0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6', // WBTC
	],
	hyperliquid: [
		'0x9ab96A4668456896d45c301Bc3A15Cee76AA7B8D', // rUSDC
		'0xB8CE59FC3717ada4C02eaDF9682A9e934F625ebb', // USD₮0
	],
	base: [
		'0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // USDC
		'0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2', // USDT
		'0x4200000000000000000000000000000000000006', // WETH
		'0x0555E30da8f98308EdB960aa94C0Db47230d2B9c', // WBTC
	],
	arbitrum: [
		'0xaf88d065e77c8cC2239327C5EDb3A432268e5831', // USDC
		'0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', // USD₮0
		'0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', // WETH
		'0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f', // WBTC
	],
	avax: [
		'0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E', // USDC
		'0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7', // USDt
		'0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB', // WETH.e
		'0x50b7545627a5162F82A992c33b87aDc75187B218', // WBTC.e
	],
	swellchain: [
		'0x9ab96A4668456896d45c301Bc3A15Cee76AA7B8D', // rUSDC
		'0x102d758f688a4C1C5a80b116bD945d4455460282', // USD₮0
		'0x4200000000000000000000000000000000000006', // WETH
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