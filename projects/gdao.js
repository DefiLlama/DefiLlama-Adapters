const utils = require('./helper/utils');
const web3 = require('./config/web3.js')


let totalSupplyABI = [
	{
		"constant":true,
		"inputs":[],
		"name":"totalSupply",
		"outputs":[{"internalType":"uint256","name":"","type":"uint256"}],
		"payable":false,
		"stateMutability":"view",
		"type":"function"
	}
];


const liquidityMinesAddress = '0x4DaC3e07316D2A31baABb252D89663deE8F76f09';
const loyaltyMineAddress = '0xda58927f4065f1d02a6ea850c2aac49d7362a643';

const stakedTokens = [
	'0x514910771af9ca656af840dff83e8264ecf986ca', //link
	'0x1f9840a85d5af5bf1d1762f925bdaddc4201f984', //uni
	'0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9', //aave
	'0x2260fac5e5542a773aa44fbcfedf7c193bc2c599', //wbtc
	'0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', //weth
	'0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f', //snx
	'0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', //usdc
	'0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e', //yfi
];

const GDAOLP = '0x4d184bf6f805ee839517164d301f0c4e5d25c374';

const gdaoToken = '0x515d7E9D75E2b76DB60F8a051Cd890eBa23286Bc';
const wethToken = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';

let priceKeys = [
	{
		'0x514910771af9ca656af840dff83e8264ecf986ca': 'chainlink',
		'0x1f9840a85d5af5bf1d1762f925bdaddc4201f984': 'uniswap',
		'0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9': 'aave',
		'0x2260fac5e5542a773aa44fbcfedf7c193bc2c599': 'bitcoin',
		'0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': 'ethereum',
		'0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f': 'havven',
		'0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': 'stable',
		'0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e': 'yearn-finance',
		'0x515d7E9D75E2b76DB60F8a051Cd890eBa23286Bc': 'governor-dao',
	}
]



async function getTotalSupply(abi, address) {
	var tcontract = new web3.eth.Contract(abi, address);
	var totalSup = await tcontract.methods.totalSupply().call();
	totalSup = await tcontract.methods.totalSupply().call();
    totalSup = web3.utils.fromWei(totalSup, "ether");
	return totalSup;
}


async function fetch() {

	var prices = await utils.getPrices(priceKeys);

	var tvl = 0;
	await Promise.all(
		stakedTokens.map(async token => {
			var balance = await utils.returnBalance(token, liquidityMinesAddress);
			var key = priceKeys[0][token]
			if (key !== 'stable') {
				tvl += balance * prices.data[key].usd;
			} else {
				tvl += balance;
			}
		})
	);
	
	var GDAOLPMinesBalance = await utils.returnBalance(GDAOLP, liquidityMinesAddress);
	var GDAOLPTotalSupply = await getTotalSupply(totalSupplyABI, GDAOLP);
	
	var ETHInLP = await utils.returnBalance(wethToken, GDAOLP);
	var GDAOInLP = await utils.returnBalance(gdaoToken, GDAOLP);
	
	var stakedLPFraction = GDAOLPMinesBalance / GDAOLPTotalSupply;
	
	tvl += stakedLPFraction * ETHInLP * prices.data['ethereum'].usd;
	tvl += stakedLPFraction * GDAOInLP * prices.data['governor-dao'].usd;
	
	var GDAOLoyaltyBalance = await utils.returnBalance(gdaoToken, loyaltyMineAddress);
	
	tvl += GDAOLoyaltyBalance * prices.data['governor-dao'].usd;
	return tvl.toFixed(2);
	
}


module.exports = {
	methodology: 'TVL counts tokens deposited in the Liquidity Mining program.',
	fetch,
}
