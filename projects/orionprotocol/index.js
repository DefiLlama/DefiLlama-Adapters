const sdk = require('@defillama/sdk')
const {transformBscAddress} = require('../helper/portedTokens')
const {calculateUniTvl} = require('../helper/calculateUniTvl')
const tvlOnPairs = require("../helper/processPairs.js");


const graphUrls = {bsc: 'https://api.thegraph.com/subgraphs/name/redallica/orion-protocol',}


async function bscTvl(timestamp, ethBlock, chainBlocks){
  const trans = await transformBscAddress()
  const balances = calculateUniTvl(trans, chainBlocks.bsc, 'bsc', '0xE52cCf7B6cE4817449F2E6fA7efD7B567803E4b4', 0, true)
  
  return balances
}


const ethFactory = "0x5FA0060FcfEa35B31F7A5f6025F0fF399b98Edf1";

const ethTvl = async (timestamp, ethBlock, chainBlocks) => {
    const balances = {};

    await tvlOnPairs("ethereum", chainBlocks, ethFactory, balances);

    return balances;
};

module.exports = {
    misrepresentedTokens: true,
    methodology: 's',
    bsc: {
      tvl: bscTvl,
    },
    ethereum: {
        tvl: ethTvl,
    },
    tvl: sdk.util.sumChainTvls([bscTvl, ethTvl]),
  }
