const sdk = require('@defillama/sdk');
const abi = require('./abi.json');
const {unwrapUniswapLPs} = require('../helper/unwrapLPs')

const tenFarmAddress= '0x264A1b3F6db28De4D3dD4eD23Ab31A468B0C1A96';

const replacements = {
  "0xa8Bb71facdd46445644C277F9499Dd22f6F0A30C": "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c", //beltBNB -> wbnb
  "0x9cb73F20164e399958261c289Eb5F9846f4D1404": "0x55d398326f99059ff775485246999027b3197955", // 4belt -> usdt
  "0x51bd63F240fB13870550423D208452cA87c44444":"0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c", //beltBTC->
  "0xAA20E8Cb61299df2357561C2AC2e1172bC68bc25":"0x2170ed0880ac9a755fd29b2688956bd959f933f8", //beltETH->
}

async function tvl(timestamp, ethBlock,chainBlocks) {
    let balances = {};

    const poolLength = (await sdk.api.abi.call({
        target: tenFarmAddress,
        abi: abi['poolLength'],
        chain:'bsc',
      })).output;

      const lps = []
    for(var i = 0 ; i < poolLength ; i++){
        const poolInfo = (await sdk.api.abi.call({
            target: tenFarmAddress,
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
    await unwrapUniswapLPs(balances, lps, chainBlocks.bsc, 'bsc', addr=>`bsc:${addr}`)
    return balances;
}

module.exports = {
  bsc:{
    tvl,
  },
  tvl
}
