const { sumTokensExport, nullAddress } = require('../helper/unwrapLPs');
const sdk = require('@defillama/sdk');
const { transformBscAddress } = require('../helper/portedTokens');

const CSC_POLYGON_CONTRACT = '0x80b313Be000c42f1f123C7FBd74654544818Ba7c';
const BSC_CONTRACT = '0xbB183c396392d08B5f4b19909C7Ce58f9c86F637';

async function tvl(chainBlocks) {
  const balances = {};
  const transform = await transformBscAddress();

  const balance = await sdk.api.eth.getBalance({
    target: BSC_CONTRACT,
    block: chainBlocks['bsc'],
    chain: 'bsc'
  });
  
  sdk.util.sumSingleBalance(balances, transform(nullAddress), balance.output)

  return balances;
}

module.exports = {
  methodology: "We count of smart contract balance in coins",
  csc: {
    tvl: sumTokensExport({ chain: 'csc', owner: CSC_POLYGON_CONTRACT, tokens: [nullAddress]}),
  },
  polygon: {
    tvl: sumTokensExport({ chain: 'polygon', owner: CSC_POLYGON_CONTRACT, tokens: [nullAddress] }),
  },
  bsc: {
    tvl
  }
}; 

