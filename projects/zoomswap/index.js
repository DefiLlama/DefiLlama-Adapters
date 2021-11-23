const sdk = require('@defillama/sdk');

const masterChef = '0x1ba725d2ba56482f11fee3642f1c739d25018e4d';
const zoomToken = '0xf87aed04889a1dd0159d9C22B0D57b345Ab16dDD';

async function staking(timestamp, ethBlock, chainBlocks) {
  const balances = {};
  const stakedZoom = sdk.api.erc20.balanceOf({
    target: zoomToken,
    owner: masterChef,
    chain: 'iotex',
    block: chainBlocks.iotex
  });

  sdk.util.sumSingleBalance(balances, 'iotex:' + zoomToken, (await stakedZoom).output);
  console.log(balances);
  return balances;
}

module.exports = {
  iotex: {
    tvl: staking
  }
};
