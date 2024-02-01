const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk')
const abis = require('./abis.json')

const stakingContract = "0x79DB0dAa012F4b98F332A9D45c80A1A3FFaa6f9a"
const wbnb = "bsc:" + ADDRESSES.bsc.WBNB

async function tvl(timestamp, ethBlock, chainBlocks){
    const stakedBNB = await sdk.api.abi.call({
        target: stakingContract,
        abi: abis.lbnbMarketCapacityCountByBNB,
        block: chainBlocks['bsc'],
        chain: 'bsc'
    })
    return {
        [wbnb]:stakedBNB.output
    }
}

module.exports = {
  bsc:{
    tvl,
  },
}