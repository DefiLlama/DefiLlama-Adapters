const sdk = require('@defillama/sdk');
const POOL_DIAMOND_CONTRACT = '0xE7D96684A56e60ffBAAe0fC0683879da48daB383';
const abi = require("./abi.json");
const tokens = require("./tokens.json");

async function tvl(timestamp, block, chainBlocks) {
  const balances = {};

  const tokensUnderManagement = [
    tokens.WMATIC,
    tokens.WETH,
    tokens.WBTC,
    tokens.USDC,
    tokens.USDT,
  ]
  
  await Promise.all(tokensUnderManagement.map(async token => {
    const balance = (await sdk.api.abi.call({
      abi: abi.balanceOf,
      chain: 'polygon',
      target: token,
      params: [POOL_DIAMOND_CONTRACT],
      block: chainBlocks['polygon'],
    })).output;
    await sdk.util.sumSingleBalance(balances, `polygon:${token}`, balance)
  }))

  return balances;
}

module.exports = {
  tvl
}; 
