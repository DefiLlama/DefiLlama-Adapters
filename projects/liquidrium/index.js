const sdk = require('@defillama/sdk');
const abi = require('./abi.json');
const {vaults} = require('./vaults');1
const axios = require('axios').default;


function calculateValue(amount, decimals){
	return amount / 10 ** decimals
}

async function tvlEth(timestamp, block) {
	let valueLocked = 0;
	for(let i=0; i<vaults.length; i++){
		if(vaults[i].chain == "ethereum"){
			const poolTVL = await sdk.api.abi.call({
				target: vaults[i].address,
				abi: abi['getTotalAmounts'],
				block: block,
				chain: vaults[i].chain
			});
			const token0Amount = calculateValue(poolTVL.output.total0, vaults[i].token1decimal)
			const token1Amount = calculateValue(poolTVL.output.total1, vaults[i].token2decimal)
		
			let api0 = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${vaults[i].token1Name}&vs_currencies=usd`)
			let api1 = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${vaults[i].token2Name}&vs_currencies=usd`)
			valueLocked = valueLocked + (api0.data[vaults[i].token1Name].usd * token0Amount) + (api1.data[vaults[i].token2Name].usd * token1Amount)
		}
	}
	return valueLocked

}


async function tvlArbitrum(timestamp, block) {
	let valueLocked = 0;
	for(let i=0; i<vaults.length; i++){
		if(vaults[i].chain == "arbitrum"){
			const poolTVL = await sdk.api.abi.call({
				target: vaults[i].address,
				abi: abi['getTotalAmounts'],
				block: block,
				chain: vaults[i].chain
			});
			const token0Amount = calculateValue(poolTVL.output.total0, vaults[i].token1decimal)
			const token1Amount = calculateValue(poolTVL.output.total1, vaults[i].token2decimal)
		
			let api0 = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${vaults[i].token1Name}&vs_currencies=usd`)
			let api1 = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${vaults[i].token2Name}&vs_currencies=usd`)
			valueLocked = valueLocked + (api0.data[vaults[i].token1Name].usd * token0Amount) + (api1.data[vaults[i].token2Name].usd * token1Amount)
		}
	}
	return valueLocked

}

async function tvlPolygon(timestamp, block) {
	let valueLocked = 0;
	for(let i=0; i<vaults.length; i++){
		if(vaults[i].chain == "polygon"){
			const poolTVL = await sdk.api.abi.call({
				target: vaults[i].address,
				abi: abi['getTotalAmounts'],
				block: block,
				chain: vaults[i].chain
			});
			const token0Amount = calculateValue(poolTVL.output.total0, vaults[i].token1decimal)
			const token1Amount = calculateValue(poolTVL.output.total1, vaults[i].token2decimal)
		
			let api0 = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${vaults[i].token1Name}&vs_currencies=usd`)
			let api1 = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${vaults[i].token2Name}&vs_currencies=usd`)
			valueLocked = valueLocked + (api0.data[vaults[i].token1Name].usd * token0Amount) + (api1.data[vaults[i].token2Name].usd * token1Amount)
		}
	}
	return valueLocked

}


module.exports = {
	polygon: {
	  tvl: tvlPolygon,
	},
	arbitrum: {
	  tvl: tvlArbitrum,
	},
	ethereum: {
		tvl: tvlEth,
	},
	tvl: sdk.util.sumChainTvls([tvlPolygon, tvlArbitrum, tvlEth]),
	methodology: 'We iterate through each HyperLiquidrium and get the total amounts of each deposited asset, then multiply it by their USD dollar provided by CoinGecko'
  };