const sdk = require('@defillama/sdk');
const abis = require('./abis.json')

const ST_CONTRACT = '0x97B05e6C5026D5480c4B6576A8699866eb58003b';

async function tvl(timestamp, block, chainBlocks) {
  const balances = {};

  const collateralBalance = (await sdk.api.abi.call({
    abi: abis.find(abi => abi.name === "getTotalPooledOKT"),
    chain: 'okexchain',
    target: ST_CONTRACT,
    block: chainBlocks['okexchain'],
  })).output;

  await sdk.util.sumSingleBalance(balances, `okexchain:0x8f8526dbfd6e38e3d8307702ca8469bae6c56c15`, collateralBalance)

  return balances;
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: 'counts the number of MINT tokens in the Club Bonding contract.',
  start: 1000235,
  okexchain: {
    tvl,
  }
}; 