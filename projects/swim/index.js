const solana = require('@solana/web3.js');
const pyth = require('@pythnetwork/client/lib');
const axios = require('axios');
const constants = require('./constants');
const secret = require('./sample_secret');

async function getTokenBalance(connection, publicKey) {
	if (!publicKey) return;

	const balance = await connection.getTokenAccountBalance(publicKey, "confirmed");

	return balance.value.uiAmount;
};

async function getLatestPythPrice(connection, pythTokenAccountStr) {
	const pythTokenAccountKey = new solana.PublicKey(pythTokenAccountStr);

	const accountInfo = await connection.getAccountInfo(pythTokenAccountKey);

	if (accountInfo) {
		const priceData = pyth.parsePriceData(accountInfo.data);
		return priceData.price;
	}
	
	console.log("Failed price query on Pyth Account");
}

async function getLatestCMCPrice(tokenSymbol) {
	let response = await axios.get('https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest', {
		headers: {
			'X-CMC_PRO_API_KEY': secret.sample_secret,
		},
	});

	if (response) {
		const json = response.data;

	    for (var i = 0; i < Object.values(json)[1].length; i++) {
			if (Object.values(json)[1][i].symbol == 'BUSD') {
				return Object.values(json)[1][i].quote.USD.price;
			}
		}
	}

    console.log("Could not find that token name on CoinMarketCap");
}

async function getPrices(connection) {
	// Get current USDC, USDT, and BSC USD
	const usdcPrice = await getLatestPythPrice(connection, constants.USDC_PYTH_ADDR);
	const usdtPrice = await getLatestPythPrice(connection, constants.USDT_PYTH_ADDR);
	const bscUSDPrice = await getLatestCMCPrice("BUSD");

	const prices = {
		'usdc': usdcPrice,
		'usdt': usdtPrice,
		'bscUSD': bscUSDPrice,
	}

	return prices;
}

async function getSolanaTVL() {
	const connection = new solana.Connection(solana.clusterApiUrl("mainnet-beta"), "confirmed");

	const prices = await getPrices(connection);

	const usdcPrice = prices['usdc'];
	const usdtPrice = prices['usdt'];

	// Get balances
	const solanaUSDC = await getTokenBalance(connection, new solana.PublicKey(constants.SOLANA_USDC_ADDR));
	const solanaUSDT = await getTokenBalance(connection, new solana.PublicKey(constants.SOLANA_USDT_ADDR));

	// sum up value of all tokens
	const tvl = usdcPrice * solanaUSDC + usdtPrice * solanaUSDT;

	return Number(tvl);
}

async function getEthTVL() {
	const connection = new solana.Connection(solana.clusterApiUrl("mainnet-beta"), "confirmed");

	const prices = await getPrices(connection);

	const usdcPrice = prices['usdc'];
	const usdtPrice = prices['usdt'];

	// Get balances
	const ethUSDC = await getTokenBalance(connection, new solana.PublicKey(constants.ETH_USDC_ADDR));
	const ethUSDT = await getTokenBalance(connection, new solana.PublicKey(constants.ETH_USDT_ADDR));

	// sum up value of all tokens
	const tvl = usdcPrice * ethUSDC + usdtPrice * ethUSDT;

	return Number(tvl);
}

async function getBNBChainTVL() {
	const connection = new solana.Connection(solana.clusterApiUrl("mainnet-beta"), "confirmed");

	const prices = await getPrices(connection);

	const bscUSDPrice = prices['bscUSD'];
	const usdtPrice = prices['usdt'];

	// Get balances
	const bscUSD = await getTokenBalance(connection, new solana.PublicKey(constants.BSC_USD_ADDR));
	const bscUSDT = await getTokenBalance(connection, new solana.PublicKey(constants.BSC_USDT_ADDR));

	// sum up value of all tokens
	const tvl = bscUSDPrice * bscUSD + usdtPrice * bscUSDT;

	return Number(tvl);
}

async function fetch() {
	const connection = new solana.Connection(solana.clusterApiUrl("mainnet-beta"), "confirmed");

	const prices = await getPrices(connection);

	const solanaTVL = await getSolanaTVL(connection, prices);
	const ethTVL = await getEthTVL(connection, prices);
	const bnbTVL = await getBNBChainTVL(connection, prices);

	// sum up tvl on all chains
	const tvl = solanaTVL + ethTVL + bnbTVL;

	return Number(tvl);
}

module.exports = {
	ethereum: {
		fetch: getEthTVL
	},
	solana: {
		fetch: getSolanaTVL
	},
	bsc: {
		fetch: getBNBChainTVL
	},
	fetch
}; // node test.js projects/swim/index.js