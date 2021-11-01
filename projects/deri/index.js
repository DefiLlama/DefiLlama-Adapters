const sdk = require('@defillama/sdk');
const { transformPolygonAddress } = require('../helper/portedTokens');
const abi = require('./abi');

async function perpetualPool(block, chain, pool, balances, transform=a=>a) {
  const { output: counts } = await sdk.api.abi.call({
    block,
    target: pool,
    params: [],
    abi: abi['getLengths'],
    chain,
  });

  const bTokenCount = counts[0];
  let bTokenIds = [];
  for (let i=0; i<parseInt(bTokenCount); i++) {
    bTokenIds.push(i.toString());
  };

  const bTokens = (await sdk.api.abi.multiCall({
    calls: bTokenIds.map((bTokenId) => ({
      target: pool,
      params: [bTokenId],
    })),
    block,
    abi: abi['getBToken'],
    chain,
  })).output.map(value => value.output);

  for (i = 0; i < bTokens.length; i++) {
    let tokenBalance = (await sdk.api.erc20.balanceOf({
      block,
      chain,
      target: bTokens[i].bTokenAddress,
      owner: pool
    })).output;
    sdk.util.sumSingleBalance(
      balances, transform(bTokens[i].bTokenAddress), tokenBalance);
  }
};
async function perpetualPoolLite(block, chain, pool, token, balances, transform=a=>a) {
  let tokenBalance = (await sdk.api.erc20.balanceOf({
    block,
    chain,
    target: token,
    owner: pool
  })).output;
  sdk.util.sumSingleBalance(balances, transform(token), tokenBalance);
};
let bscContracts = {
  'a' : {
    'bTokenSymbol': '0xe9e7cea3dedca5984780bafc599bd69add087d56',
    'pool': '0x4B439ABCBc736837D0F7f7A9C5619bF8fa650e15'
  },
  'b': {
    'bTokenSymbol': '0xe9e7cea3dedca5984780bafc599bd69add087d56',
    'pool': '0xbC259DCA83b7EdD81b28BcCd1fee87d7b881785a',
    lite: true
  },
  'everlastingOption': {
    'bTokenSymbol': '0xe9e7cea3dedca5984780bafc599bd69add087d56',
    'pool': '0x6fEfdd54E0aA425F9B0E647d5BA6bF6d6f3F8Ab8',
    lite: true,
  },
  'deriPool': {
    'bTokenSymbol': '0xe60eaf5a997dfae83739e035b005a33afdcc6df5',
    'pool': '0x9e2f5E284BEEb2C955987eD1EbB2149494CC1e41',
    lite:true
  }
};
let polygonContracts = {
  'a': {
    'bTokenSymbol': '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
    'pool': '0x6be39f5C04C837aE3c55bF19D10EC370c52Dc0ac'
  },
  'b': {
    'bTokenSymbol': '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
    'pool': '0x9C0033D74618BC081Aca8b5E4bf64574a8C5960E',
    lite: true
  },
  'deriPool':{
    'bTokenSymbol': '0x3d1d2afd191b165d140e3e8329e634665ffb0e5e',
    'pool': '0x29e9dC4634bd9a8930FF07f4Fa2E1479CDF5d17F',
    lite: true
  }
};
async function bsc(timestamp, ethBlock, chainBlocks) {
  let balances = {};
  const transform = a=>`bsc:${a}`
  for ([key, contract] of Object.entries(bscContracts)) {
    if(contract.lite === true){
      await perpetualPoolLite(chainBlocks['bsc'], 'bsc', contract.pool, 
      contract.bTokenSymbol, balances, transform);
    } else {
      await perpetualPool(chainBlocks['bsc'], 'bsc', contract.pool, 
        balances, transform);
    }
  };
  return balances;
};
async function polygon(timestamp, ethBlock, chainBlocks) {
  let balances = {};
  const transform = await transformPolygonAddress()
  for ([key, contract] of Object.entries(polygonContracts)) {
    if(contract.lite === true){
      await perpetualPoolLite(chainBlocks['polygon'], 'polygon', contract.pool, 
      contract.bTokenSymbol, balances, transform);
    } else {
      await perpetualPool(chainBlocks['polygon'], 'polygon', contract.pool, 
        balances, transform);
    }
  };
  return balances;
};
// node test.js projects/deri/index.js
module.exports = {
  bsc: {
    tvl: bsc
  },
  polygon:{
    tvl: polygon
  }
}