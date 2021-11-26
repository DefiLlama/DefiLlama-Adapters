const sdk = require('@defillama/sdk');
const abi = require('./abi.json');
const {unwrapUniswapLPs} = require('../helper/unwrapLPs')

const aquaFarmAddress= '0x0ac58Fd25f334975b1B61732CF79564b6200A933';
const newFarmAddress= '0xB87F7016585510505478D1d160BDf76c1f41b53d';

const replacements = {
  "0xa8Bb71facdd46445644C277F9499Dd22f6F0A30C": "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c", //beltBNB -> wbnb
  "0x9cb73F20164e399958261c289Eb5F9846f4D1404": "0x55d398326f99059ff775485246999027b3197955", // 4belt -> usdt
  "0x51bd63F240fB13870550423D208452cA87c44444":"0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c", //beltBTC->
  "0xAA20E8Cb61299df2357561C2AC2e1172bC68bc25":"0x2170ed0880ac9a755fd29b2688956bd959f933f8", //beltETH->
}

const greenMarkets = {
  0:"0x24664791B015659fcb71aB2c9C0d56996462082F", //BNB
  1:"0xF701A48e5C751A213b7c540F84B64b5A6109962E", //GAMMA
  2:"0x928fa017eBf781947102690c9b176996B2E00f22", //BUSD
  3:"0xB3A4ce0654524dCF4B5165cee280EbE69a6E8133", //AQUA
  4:"0xa5ae8459e710F95ca0C93d73F63a66d9996F1ACE", //UST
  5:"0xcfa5b884689dc09e4503e84f7877d3A583fcceef", //BTCB
  6:"0x66fD9D390De6172691EC0ddF0ac7F231c1f9a434", //ETH
  7:"0x854a534cEFAf8fD20A70C9DC976C4f65324D7B42", //USDC
  8:"0x4c2bddc208B58534EdDC1fba7B2828CAb70797b5", //USDT
  9:"0x8B2f098411Ce4B32c9D2110FeF257Cf01D006bA5", //DAI
}

const greenMarketReplacement = {
  "0x24664791B015659fcb71aB2c9C0d56996462082F":"0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", //BNB
  "0xF701A48e5C751A213b7c540F84B64b5A6109962E":"0xb3Cb6d2f8f2FDe203a022201C81a96c167607F15", //GAMMA
  "0x928fa017eBf781947102690c9b176996B2E00f22":"0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56", //BUSD
  "0xB3A4ce0654524dCF4B5165cee280EbE69a6E8133":"0x72B7D61E8fC8cF971960DD9cfA59B8C829D91991", //AQUA
  "0xa5ae8459e710F95ca0C93d73F63a66d9996F1ACE":"0x23396cF899Ca06c4472205fC903bDB4de249D6fC", //UST
  "0xcfa5b884689dc09e4503e84f7877d3A583fcceef":"0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c", //BTCB
  "0x66fD9D390De6172691EC0ddF0ac7F231c1f9a434":"0x2170Ed0880ac9A755fd29B2688956BD959F933F8", //ETH
  "0x854a534cEFAf8fD20A70C9DC976C4f65324D7B42":"0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", //USDC
  "0x4c2bddc208B58534EdDC1fba7B2828CAb70797b5":"0x55d398326f99059fF775485246999027B3197955", //USDT
  "0x8B2f098411Ce4B32c9D2110FeF257Cf01D006bA5":"0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3", //DAI
}

async function tvl(timestamp, ethBlock,chainBlocks) {
    let balances = {};
    const lps = []
    
    let poolLength = (await sdk.api.abi.call({
        target: aquaFarmAddress,
        abi: abi['poolLength'],
        chain:'bsc',
      })).output;


    for(var i = 0 ; i < poolLength ; i++){
        const poolInfo = (await sdk.api.abi.call({
            target: aquaFarmAddress,
            abi: abi['poolInfo'],
            chain:'bsc',
            params:i
          })).output;

        const strategyAddress = poolInfo['strat'];
        const wantAddress = poolInfo['want']

        const wantSymbol = await sdk.api.erc20.symbol(wantAddress, "bsc")
        
        const poolTVL = (await sdk.api.abi.call({
            target: strategyAddress,
            abi: abi['wantLockedTotal'],
            chain:'bsc'
          })).output;
        if(wantSymbol.output.endsWith('LP')){
          lps.push({
            token: wantAddress,
            balance: poolTVL
          })
        } else {
          let addr = replacements[wantAddress] ?? wantAddress
          sdk.util.sumSingleBalance(balances, 'bsc:'+addr, poolTVL)
        }
    }

    //New Farm

    poolLength = (await sdk.api.abi.call({
        target: newFarmAddress,
        abi: abi['poolLength'],
        chain:'bsc',
      })).output;

    for(var i = 0 ; i < poolLength ; i++){
        const poolInfo = (await sdk.api.abi.call({
            target: newFarmAddress,
            abi: abi['poolInfo'],
            chain:'bsc',
            params:i
          })).output;

        const strategyAddress = poolInfo['strat'];
        const wantAddress = poolInfo['want']

        const wantSymbol = await sdk.api.erc20.symbol(wantAddress, "bsc")
        
        const poolTVL = (await sdk.api.abi.call({
            target: strategyAddress,
            abi: abi['wantLockedTotal'],
            chain:'bsc'
          })).output;
        if(wantSymbol.output.endsWith('LP')){
          lps.push({
            token: wantAddress,
            balance: poolTVL
          })
        } else {
          let addr = replacements[wantAddress] ?? wantAddress
          sdk.util.sumSingleBalance(balances, 'bsc:'+addr, poolTVL)
        }
    }

    //Green Planet

    let marketLength = Object.keys(greenMarkets).length;

    for(var i = 0 ; i < marketLength ; i++){
      
      const totalSupply = (await sdk.api.abi.call({
          target: greenMarkets[i],
          abi: abi['totalSupply'],
          chain:'bsc',
        })).output;

      const exchangeRateStored = (await sdk.api.abi.call({
          target: greenMarkets[i],
          abi: abi['exchangeRateStored'],
          chain:'bsc',
        })).output;

      const marketTvl = ((totalSupply * exchangeRateStored) / 1e18)
      
      let addr = greenMarketReplacement[greenMarkets[i]]
      sdk.util.sumSingleBalance(balances, 'bsc:'+addr, marketTvl)

      
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
