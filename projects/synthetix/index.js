const sdk = require('@defillama/sdk');
const BigNumber = require('bignumber.js');
const _ = require('underscore');
const abi = require('./abi');
const { getBlock } = require('../helper/getBlock');
const { requery } = require('../helper/requery');
const { request, gql } = require("graphql-request");

const QUERY = gql`
query manyHolders($lastID: String, $block: Int) {
  holders(first: 1000, where: { 
    id_gt: $lastID
  },
    block: { number: $block }  
  ){
    id
  }
}
`

const QUERY_OPTIMISM = gql`
query manyHolders($lastID: String, $block: Int) {
  holders(first: 1000, where: {
    id_gt: $lastID
  }){
    id
  }
}
`

const synthetixStates = {
  ethereum: '0x4b9Ca5607f1fF8019c1C6A3c2f0CC8de622D5B82',
  optimism: '0x8377b25B8564f6Be579865639776c5082CB37163' // It's Issuer, not SynthetixState but has the same issuanceRatio function
}
const synthetixs = {
  ethereum: '0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F',
  optimism: '0x8700daec35af8ff88c16bdf0418774cb3d7599b4'
}
const snxGraphEndpoints = {
  ethereum: 'https://api.thegraph.com/subgraphs/name/0xngmi/snx-lite-ethereum',
  optimism: 'https://api.thegraph.com/subgraphs/name/0xngmi/snx-lite-optimism'
}
const ethStaking = "0xc1aae9d18bbe386b102435a8632c8063d31e747c"
const weth = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"

function chainTvl(chain) {
  return async (timestamp, ethBlock, chainBlocks) => {
    const block = await getBlock(timestamp, chain, chainBlocks)
    const synthetixState = synthetixStates[chain]
    const synthetix = synthetixs[chain]
    const snxGraphEndpoint = snxGraphEndpoints[chain]
    let totalTopStakersSNXLocked = new BigNumber(0);
    let totalTopStakersSNX = new BigNumber(0);

    const holders = await SNXHolders(snxGraphEndpoint, block, chain);

    const issuanceRatio = (await sdk.api.abi.call({
      block,
      chain,
      target: synthetixState,
      abi: abi['issuanceRatio']
    })).output;

    const [ratio, collateral] = await Promise.all([
      sdk.api.abi.multiCall({
        block,
        chain,
        abi: abi['collateralisationRatio'],
        calls: _.map(holders, holder => ({ target: synthetix, params: holder.id }))
      }),
      sdk.api.abi.multiCall({
        block,
        chain,
        abi: abi['collateral'],
        calls: _.map(holders, holder => ({ target: synthetix, params: holder.id }))
      })
    ]);
    await requery(ratio, chain, block, abi['collateralisationRatio'])
    await requery(collateral, chain, block, abi['collateral'])
    const ratios = {}
    ratio.output.forEach(r => ratios[r.input.params[0]] = r.output)
    const collaterals = {}
    collateral.output.forEach(r => collaterals[r.input.params[0]] = r.output)

    _.forEach(holders, (holder) => {
      let _collateral = collaterals[holder.id];
      let _ratio = ratios[holder.id];
      if(_collateral === null || _ratio === null){
        throw new Error(`Failed request for collateral/ratio of holder ${holder.id}`)
      }
      let locked = _collateral * Math.min(1, _ratio / issuanceRatio);
      totalTopStakersSNX = totalTopStakersSNX.plus(_collateral)
      totalTopStakersSNXLocked = totalTopStakersSNXLocked.plus(locked);
    });

    const percentLocked = totalTopStakersSNXLocked.div(totalTopStakersSNX);
    const unformattedSnxTotalSupply = (await sdk.api.abi.call({
      block,
      chain,
      target: synthetix,
      abi: abi['totalSupply']
    })).output;

    //console.log(unformattedSnxTotalSupply, new BigNumber(unformattedSnxTotalSupply).div(Math.pow(10, 18)))
    const snxTotalSupply = parseInt(new BigNumber(unformattedSnxTotalSupply).div(Math.pow(10, 18)));
    const totalSNXLocked = percentLocked.times(snxTotalSupply);

    const balances = {
      [synthetixs.ethereum]: totalSNXLocked.times(Math.pow(10, 18)).toFixed(0),
    }
    if (chain === "ethereum") {
      const ethStaked = await sdk.api.erc20.balanceOf({
        target: weth,
        owner: ethStaking,
        block
      })
      balances[weth] = ethStaked.output
    }

    return balances;
  }
}

// Uses graph protocol to run through SNX contract. Since there is a limit of 100 results per query
// we can use graph-results-pager library to increase the limit.
async function SNXHolders(snxGraphEndpoint, block, chain) {
  let holders = []
  let lastID = ""
  let holdersPage;
  do {
    holdersPage = (await request(snxGraphEndpoint, chain==="optimism"?QUERY_OPTIMISM:QUERY, {
      block,
      lastID
    })).holders
    holders = holders.concat(holdersPage)
    lastID = holdersPage[holdersPage.length - 1]?.id
  } while (holdersPage.length === 1e3);
  return holders
}

module.exports = {
  start: 1565287200,  // Fri Aug 09 2019 00:00:00
  optimism: {
    tvl: chainTvl("optimism")
  },
  ethereum: {
    tvl: chainTvl("ethereum"),
  },
  tvl: sdk.util.sumChainTvls(["ethereum", "optimism"].map(chainTvl))
};
