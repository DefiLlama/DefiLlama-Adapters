const sdk = require('@defillama/sdk');
const abi = require('./abi.json');
const abi_kingdom = require('./abi_kingdom.json');
const {unwrapUniswapLPs} = require('../helper/unwrapLPs')

const cubFarmAddress= '0x227e79c83065edb8b954848c46ca50b96cb33e16';
const cubKingdomFarmAddress = '0x2E72f4B196b9E5B89C29579cC135756a00E6CBBd';

const replacements = {
  "0xa8Bb71facdd46445644C277F9499Dd22f6F0A30C": "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c", //beltBNB -> wbnb
  "0x9cb73F20164e399958261c289Eb5F9846f4D1404": "0x55d398326f99059ff775485246999027b3197955", // 4belt -> usdt
  "0x51bd63F240fB13870550423D208452cA87c44444":"0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c", //beltBTC->
  "0xAA20E8Cb61299df2357561C2AC2e1172bC68bc25":"0x2170ed0880ac9a755fd29b2688956bd959f933f8", //beltETH->
}

// Excluded farms/Kingdoms - These are the farms/Kingdoms that include the protocol token.
const farmsExcluded = [29,27]; // 29 is CUB-BUSD, 27 is CUB-BNB
const kingdomsExcluded = [4]; // this is the CUB Kingdom

const first_pool = 25;
async function tvl(timestamp, ethBlock,chainBlocks) {
    let balances = {};
	// farms
    const poolLength = (await sdk.api.abi.call({
        target: cubFarmAddress,
        abi: abi['poolLength'],
        chain:'bsc',
      })).output;

      const lps = []
    for(var i = first_pool ; i < poolLength ; i++){
        if (!farmsExcluded.includes(i)){
			const poolInfo = (await sdk.api.abi.call({
	            target: cubFarmAddress,
	            abi: abi['poolInfo'],
	            chain:'bsc',
	            params:i
	          })).output;
	
	        const strategyAddress = poolInfo['lpToken'];
	        
			
	        const poolTVL = (await sdk.api.abi.call({
	            target: strategyAddress,
	            params: cubFarmAddress,
				abi: abi['balanceOf'],
	            chain:'bsc'
	          })).output;
	        	
	       
			lps.push({
	            token: strategyAddress,
	            balance: poolTVL
	          })
			}
         
        }
   // Kingdoms
	
	const poolLength_kingdom = (await sdk.api.abi.call({
        target: cubKingdomFarmAddress,
        abi: abi_kingdom['poolLength'],
        chain:'bsc',
      })).output;

      
    for(var i = 0 ; i < poolLength_kingdom ; i++){
        if (!kingdomsExcluded.includes(i)){
		
			const poolInfoKingdom = (await sdk.api.abi.call({
	            target: cubKingdomFarmAddress,
	            abi: abi_kingdom['poolInfo'],
	            chain:'bsc',
	            params:i
	          })).output;
	
	        const strategyAddressKingdom = poolInfoKingdom['strat'];
	        const wantAddress = poolInfoKingdom['want']
	
	        const wantSymbol = await sdk.api.erc20.symbol(wantAddress, "bsc")
	        
	        const poolTVLKingdom = (await sdk.api.abi.call({
	            target: strategyAddressKingdom,
	            abi: abi_kingdom['wantLockedTotal'],
	            chain:'bsc'
	          })).output;
	        if(wantSymbol.output.endsWith('LP')){
	          lps.push({
	            token: wantAddress,
	            balance: poolTVLKingdom
	          })
	        } else {
	          let addr = replacements[wantAddress] ?? wantAddress
	          sdk.util.sumSingleBalance(balances, 'bsc:'+addr, poolTVLKingdom)
	        }
		}
    }
	
    await unwrapUniswapLPs(balances, lps, chainBlocks.bsc, 'bsc', addr=>`bsc:${addr}`)
    return balances;
}

module.exports = {
  bsc:{
    tvl,
  },
  tvl
}