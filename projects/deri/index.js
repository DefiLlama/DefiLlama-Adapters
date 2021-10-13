const sdk = require('@defillama/sdk');
const abi = require('./abi');
const { transformBscAddress, 
  transformPolygonAddress } = require("../helper/portedTokens");

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
let stakingContracts = {
  'polygon': {
    'token': '0x3d1d2afd191b165d140e3e8329e634665ffb0e5e',
    'pool': '0xa4eDe2C4CB210CD07DaFbCe56dA8d36b7d688cd0'
  },
  'bsc': {
    'token': '0xe60eaf5a997dfae83739e035b005a33afdcc6df5',
    'pool': '0x1a9b1B83C4592B9F315E933dF042F53D3e7E4819'
  }
};
let bscContracts = {
  'a' : {
    'bTokenSymbol': '0x4fabb145d64652a948d72533023f6e7a623c7c53',
    'pool': '0x19c2655A0e1639B189FB0CF06e02DC0254419D92'
  },
  'b': {
    'bTokenSymbol': '0xe9e7cea3dedca5984780bafc599bd69add087d56',
    'pool': '0x3465A2a1D7523DAF811B1abE63bD9aE36D2753e0'
  },
  'everlastingOption': {
    'bTokenSymbol': '0xe9e7cea3dedca5984780bafc599bd69add087d56',
    'pool': '0xD5147D3d43BB741D8f78B2578Ba8bB141A834de4'
  }
};
let polygonContracts = {
  'a': {
    'bTokenSymbol': '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
    'pool': '0x43b4dfb998b4D17705EEBfFCc0380c6b98699252'
  },
  'b': {
    'bTokenSymbol': '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
    'pool': '0xb144cCe7992f792a7C41C2a341878B28b8A11984'
  }
};
async function bsc(timestamp, ethBlock, chainBlocks) {
  let balances = {};
  for ([key, contract] of Object.entries(bscContracts)) {
    try {
      await perpetualPool(chainBlocks['bsc'], 'bsc', contract.pool, 
        balances, await transformBscAddress());
    } catch {
      await perpetualPoolLite(chainBlocks['bsc'], 'bsc', contract.pool, 
        contract.bTokenSymbol, balances, await transformBscAddress());
    };
  };
  return balances;
};
async function polygon(timestamp, ethBlock, chainBlocks) {
  let balances = {};
  for ([key, contract] of Object.entries(polygonContracts)) {
    try {
      await perpetualPool(chainBlocks['polygon'], 'polygon', contract.pool, 
        balances, await transformPolygonAddress());
    } catch {
      await perpetualPoolLite(chainBlocks['polygon'], 'polygon', contract.pool, 
      contract.bTokenSymbol, balances, await transformPolygonAddress());
    };
  };
  return balances;
};
async function staking(timestamp, ethBlock, chainBlocks) {
  let balances = {};
  for ([key, contract] of Object.entries(stakingContracts)) {

    let transform=a=>a;
    switch (key) {
      case 'bsc':
        transform = await transformBscAddress(); 
        break;
      case 'polygon':
        transform = await transformPolygonAddress(); 
        break;
    };

    try {
      await perpetualPool(chainBlocks[key], key, contract.pool, 
        balances, transform);
    } catch {
      await perpetualPoolLite(chainBlocks[key], key, contract.pool, 
        contract.token, balances, transform);
    };
  };
  return balances;
};
// node test.js projects/deri/index.js
module.exports = {
  bsc: {
    tvl: bsc
  },
  polygon: {
    tvl: polygon
  },
  staking: {
    tvl: staking
  }
}