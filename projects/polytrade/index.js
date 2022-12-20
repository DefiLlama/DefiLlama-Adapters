const sdk = require('@defillama/sdk');
const ABI = require('../polytrade.json');
const TRADE_TOKEN_CONTRACT = '0x63168f8335B0CF03d58C80e182b9aEa4558064Da';
const LENDER_POOL_CONTRACT = '0xE544a0Ca5F4a01f137AE5448027471D6a9eC9661';


async function tvl(_, _block, chainBlocks) {
  const balances = {};
  const transform = await transformBscAddress();

  const liquidityBalance = (await sdk.api.abi.call({
    abi: ABI,
    chain: 'polygon',
    target: LENDER_POOL_CONTRACT,
    block: chainBlocks['polygon'],
  })).output;

  await sdk.util.sumSingleBalance(balances, `polygon:${TRADE_TOKEN_CONTRACT}`, liquidityBalance)

  return balances;
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: false,
  methodology: 'gets the amount in liquidity pool',
  start: 1657074187,
  polygon: {
    tvl,
  }
}; 