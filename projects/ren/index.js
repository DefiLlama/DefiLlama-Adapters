const { request, gql } = require("graphql-request");
const sdk = require('@defillama/sdk');
const BigNumber = require("bignumber.js");
const { toUSDT } = require('../helper/balances');


const ethGraphUrl = 'https://api.thegraph.com/subgraphs/name/renproject/renvm'
const bscGraphUrl = 'https://api.bscgraph.org/subgraphs/name/renproject/renvm'
const graphQuery = gql`
{
  assets {
    symbol
    tokenAddress
  }
}
`;
const darkNodeStakingContract = "0x60Ab11FE605D2A2C3cf351824816772a131f8782";
const renToken = '0x408e41876cCCDC0F92210600ef50372656052a38'

async function getAssetBalance(block, graphUrl, transformAddr, chain){
  const balances = {}
  const {assets} = await request(
    graphUrl,
    graphQuery
  );
  const assetCalls = assets.map(asset=>({
    target: asset.tokenAddress
  }))
  const totalSupplies = sdk.api.abi.multiCall({
    abi: 'erc20:totalSupply',
    block,
    chain,
    calls: assetCalls
  });

  const resolvedSupplies = (await totalSupplies).output
  assets.forEach((asset, index)=>{
    if(!resolvedSupplies[index].success){
      throw new Error('totalSupply() failed')
    }
    sdk.util.sumSingleBalance(balances, transformAddr(asset.tokenAddress), resolvedSupplies[index].output)
  })
  return balances
}

async function bsc(timestamp, ethBlock, chainBlocks) {
  return getAssetBalance(chainBlocks['bsc'], bscGraphUrl, ad=>`bsc:${ad}`, 'bsc')
}


async function eth(timestamp, block) {
  const balances = await getAssetBalance(block, ethGraphUrl, a=>a, 'ethereum')
  const stakedRen = await sdk.api.abi.call({
    target: renToken,
    abi: 'erc20:balanceOf',
    params: [darkNodeStakingContract],
    block
  });
  balances[renToken] = stakedRen.output;
  return balances
}

module.exports = {
  ethereum:{
    tvl: eth
  },
  bsc: {
    tvl: bsc
  },
  tvl: sdk.util.sumChainTvls([eth, bsc])
}