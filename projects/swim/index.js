const solana = require('@solana/web3.js');
const pyth = require('@pythnetwork/client/lib');
const axios = require('axios');
const constants = require('./constants');
const secret = require('./sample_secret');

async function getTokenBalance(connection, publicKey) {
  if (!publicKey) return;

  try {
    const balance = await connection.getTokenAccountBalance(publicKey, "confirmed");
    return balance.value.uiAmount;
  } catch (error) {
    console.log(error);
    return 0;
  }
};

async function getLatestPythPrice(connection, pythTokenAccountStr) {
	const pythTokenAccountKey = new solana.PublicKey(pythTokenAccountStr);

	try {
		const accountInfo = await connection.getAccountInfo(pythTokenAccountKey);
		const priceData = pyth.parsePriceData(accountInfo.data);
		return priceData.price;
	} catch (error) {
		console.log("Failed price query on Pyth Account");
	}
}

async function getLatestCMCPrice(tokenSymbol) {
	let response = null;
	try {
		response = await axios.get('https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest', {
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
	} catch (error) {
    	response = null;
    	console.log("Failed price query on CoinMarketCap");
    	return;
    }

    console.log("Could not find that token name on CoinMarketCap");
}

async function fetch() {
	const connection = new solana.Connection(solana.clusterApiUrl("mainnet-beta"), "confirmed");

	// Get balances for the Hexapool
	const solanaUSDC = await getTokenBalance(connection, new solana.PublicKey(constants.SOLANA_USDC_ADDR));
	const solanaUSDT = await getTokenBalance(connection, new solana.PublicKey(constants.SOLANA_USDT_ADDR));

	const ethUSDC = await getTokenBalance(connection, new solana.PublicKey(constants.ETH_USDC_ADDR));
	const ethUSDT = await getTokenBalance(connection, new solana.PublicKey(constants.ETH_USDT_ADDR));

	const bscUSD = await getTokenBalance(connection, new solana.PublicKey(constants.BSC_USD_ADDR));
	const bscUSDT = await getTokenBalance(connection, new solana.PublicKey(constants.BSC_USDT_ADDR));

	// Get current USDC, USDT, and BSC USD
	const usdcPrice = await getLatestPythPrice(connection, constants.USDC_PYTH_ADDR);
	const usdtPrice = await getLatestPythPrice(connection, constants.USDT_PYTH_ADDR);
	let bscUSDPrice = await getLatestCMCPrice("BUSD");

	// sum up value of all tokens
	const tvl = usdcPrice * solanaUSDC +
				usdtPrice * solanaUSDT + 
				usdcPrice * ethUSDC + 
				usdtPrice * ethUSDT + 
				bscUSDPrice * bscUSD + 
				usdtPrice * bscUSDT;

	return Number(tvl);
}

module.exports = {
	fetch
};