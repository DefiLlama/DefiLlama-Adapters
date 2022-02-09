const retry = require('async-retry');
const { default: axios } = require('axios');
const { GraphQLClient, gql } = require('graphql-request');

async function fetch() {
	var endpoint ='https://api.thegraph.com/subgraphs/name/sameepsi/quickswap05';
	var graphQLClient = new GraphQLClient(endpoint)

	var query = gql`
		{
			pair(id: "0xa823acb033f3fd8392e925958b790747e9e68545") {
			reserveUSD
		}
	}`;

	const liquidity = await retry(async bail => await graphQLClient.request(query))

	const masterChefWbtcBalance = await axios.get("https://api.polygonscan.com/api?module=account&action=tokenbalance&contractaddress=0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6&address=0xE139E30D5C375C59140DFB6FD3bdC91B9406201c&tag=latest&apikey=4FK3BU6MATEFKHD3H8Z6VQWS2IKP2AZFRH")
	const masterChefUSDCBalance = await axios.get("https://api.polygonscan.com/api?module=account&action=tokenbalance&contractaddress=0xa823acb033f3fd8392e925958b790747e9e68545&address=0xE139E30D5C375C59140DFB6FD3bdC91B9406201c&tag=latest&apikey=4FK3BU6MATEFKHD3H8Z6VQWS2IKP2AZFRH")
	const masterChefDAIBalance = await axios.get("https://api.polygonscan.com/api?module=account&action=tokenbalance&contractaddress=0x8f3cf7ad23cd3cadbd9735aff958023239c6a063&address=0xE139E30D5C375C59140DFB6FD3bdC91B9406201c&tag=latest&apikey=4FK3BU6MATEFKHD3H8Z6VQWS2IKP2AZFRH")
	const masterChefWETHBalance = await axios.get("https://api.polygonscan.com/api?module=account&action=tokenbalance&contractaddress=0x7ceb23fd6bc0add59e62ac25578270cff1b9f619&address=0xE139E30D5C375C59140DFB6FD3bdC91B9406201c&tag=latest&apikey=4FK3BU6MATEFKHD3H8Z6VQWS2IKP2AZFRH")
	const masterChefWMATICBalance = await axios.get("https://api.polygonscan.com/api?module=account&action=tokenbalance&contractaddress=0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270&address=0xE139E30D5C375C59140DFB6FD3bdC91B9406201c&tag=latest&apikey=4FK3BU6MATEFKHD3H8Z6VQWS2IKP2AZFRH")

	const wbtcPrice = await (await axios.get("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd")).data.bitcoin.usd;
	const wethPrice = await (await axios.get("https://api.coingecko.com/api/v3/simple/price?ids=weth&vs_currencies=usd")).data.weth.usd;
	const wmaticPrice = await (await axios.get("https://api.coingecko.com/api/v3/simple/price?ids=wmatic&vs_currencies=usd")).data.wmatic.usd;

	const tvl = +liquidity.pair.reserveUSD + (+masterChefWbtcBalance.data.result * +wbtcPrice)
	+ (+masterChefUSDCBalance.data.result * 1)
	+ (+masterChefDAIBalance.data.result * 1)
	+ (+masterChefWETHBalance.data.result * +wethPrice)
	+ (+masterChefWMATICBalance.data.result * +wmaticPrice)

	return tvl;
}

fetch();

module.exports = {
  fetch
}
