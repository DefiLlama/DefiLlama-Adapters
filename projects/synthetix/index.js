const sdk = require('@defillama/sdk');
const BigNumber = require('bignumber.js');
const _ = require('underscore');
const abi = require('./abi');
const pageResults = require('graph-results-pager');

const synthetixState = '0x4b9Ca5607f1fF8019c1C6A3c2f0CC8de622D5B82'
const synthetix = '0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F'
const snxGraphEndpoint = 'https://api.thegraph.com/subgraphs/name/synthetixio-team/synthetix';
const ethStaking = "0xc1aae9d18bbe386b102435a8632c8063d31e747c"
const weth = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"

async function eth(timestamp, block) {

  let totalTopStakersSNXLocked = new BigNumber(0);
  let totalTopStakersSNX = new BigNumber(0);

  const holders = await SNXHolders(block);

  const issuanceRatio = (await sdk.api.abi.call({
    block,
    target: synthetixState,
    abi: abi['issuanceRatio']
  })).output;

  const ratio = (await sdk.api.abi.multiCall({
    block,
    abi: abi['collateralisationRatio'],
    calls: _.map(holders, holder => ({ target: synthetix, params: holder.id }))
  })).output;

  _.forEach(holders, (holder) => {
    let _collateral = holder.collateral;
    let _ratio = _.find(ratio, result => result.input.params[0] === holder.id).output;
    let locked = _collateral * Math.min(1, _ratio / issuanceRatio);
    totalTopStakersSNX = totalTopStakersSNX.plus(_collateral)
    totalTopStakersSNXLocked = totalTopStakersSNXLocked.plus(locked);
  });

  const percentLocked = totalTopStakersSNXLocked.div(totalTopStakersSNX);
  const unformattedSnxTotalSupply = (await sdk.api.abi.call({
    block,
    target: synthetix,
    abi: abi['totalSupply']
  })).output;

  //console.log(unformattedSnxTotalSupply, new BigNumber(unformattedSnxTotalSupply).div(Math.pow(10, 18)))
  const snxTotalSupply = parseInt(new BigNumber(unformattedSnxTotalSupply).div(Math.pow(10, 18)));
  const totalSNXLocked = percentLocked.times(snxTotalSupply);


  const ethStaked = await sdk.api.erc20.balanceOf({
    target: weth,
    owner: ethStaking,
    block
  })

  return {
    [synthetix]: totalSNXLocked.times(Math.pow(10, 18)).toFixed(0),
    [weth]: ethStaked.output
  };
}

// Uses graph protocol to run through SNX contract. Since there is a limit of 100 results per query
// we can use graph-results-pager library to increase the limit.
async function SNXHolders(blockNumber) {
  return await pageResults({
    api: snxGraphEndpoint,
    query: {
      entity: 'snxholders',
      selection: {
        orderBy: 'collateral',
        orderDirection: 'desc',
        block: {
          number: blockNumber
        },
        where: {
          collateral_gt: 0
        }
      },
      properties: ['collateral', 'id'],
    },
    max: 5000, // top 10000 SNX holders with collateral. At the time of this commit, there are 51,309 SNX holders. (7/27/2020)
  });
}

async function optimism(_timestamp, _ethBlock, chainBlocks){
  return {
    [synthetix]: (await sdk.api.erc20.totalSupply({
      target: "0x8700daec35af8ff88c16bdf0418774cb3d7599b4",
      chain: 'optimism',
      block: chainBlocks.optimism
    })).output
  }
}

module.exports = {
  start: 1565287200,  // Fri Aug 09 2019 00:00:00
  ethereum:{
    tvl: eth,
  },
  optimism:{
    tvl: optimism
  },
  tvl: sdk.util.sumChainTvls([eth, optimism])
};
