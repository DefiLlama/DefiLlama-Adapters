const axios = require('axios')
const retry = require('async-retry')
const sdk = require("@defillama/sdk");
const BhavishAbi = require("./bhavish_sdk_abi.json");
const BigNumber = require("bignumber.js");

const sdkContract_V1 = "0x135438f0b599540EbfD6aed4A3f84C1171fc057D";
const sdkContract_V2 = "0x4e60a426eA122Cb35C35FBDA9F5F732995B9E226";
const polygonMaticContract = '0x0000000000000000000000000000000000001010'
const contractDeployedYear = 2022;

async function polyTvl(timestamp, ethBlock, chainBlocks) {
  const priceFeed = await retry(async bail =>
    await axios('https://api.coingecko.com/api/v3/simple/price?ids=matic-network&vs_currencies=usd'))
  let balance = new Number();

  for (var year = contractDeployedYear; year <= new Date().getFullYear(); year++) {
    const { output: totalYearlyPremiumCollected } = await sdk.api.abi.call({
        block: chainBlocks.polygon,
        chain: 'polygon',
        target: sdkContract_V2,
        abi: BhavishAbi.find(i => i.name === 'totalYearlyPremiumCollected'),
        params: year,
    });
    balance += Number(totalYearlyPremiumCollected)
  }

  for (var year = contractDeployedYear; year <= new Date().getFullYear(); year++) {
    const { output: totalYearlyPremiumCollected } = await sdk.api.abi.call({
        block: chainBlocks.polygon,
        chain: 'polygon',
        target: sdkContract_V1,
        abi: BhavishAbi.find(i => i.name === 'totalYearlyPremiumCollected'),
        params: year,
    });
    balance += Number(totalYearlyPremiumCollected)
  }
  
  return {['polygon:' + polygonMaticContract]: balance*priceFeed.data['matic-network']['usd']}
}

module.exports = {
  methodology:
    "TVL are the tokens locked into the index contracts. Pool2 are the tokens locked into DEX LP. Staking are the tokens locked into the active staking contract.",
  polygon: {
    tvl: polyTvl
  }
};