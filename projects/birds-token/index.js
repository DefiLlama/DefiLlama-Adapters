const sdk = require('@defillama/sdk');
const { transformBscAddress } = require('../helper/portedTokens');
const Birds_Token_CONTRACT = '0x350d836dD9BDDb1CF874BF0D6680917024b72dC2';
const PancakeSwap_V2_CONTRACT = '0xc8b056E5c14cD530bEB720fb031C00D9C2cD7012';

async function tvl(timestamp, block, chainBlocks) {
  const balances = {};
  const transform = await transformBscAddress();

  const collateralBalance = (await sdk.api.abi.call({
    abi: 'erc20:balanceOf',
    chain: 'bsc',
    target: Birds_Token_CONTRACT,
    params: [PancakeSwap_V2_CONTRACT],
    block: chainBlocks['bsc'],
  })).output;

  await sdk.util.sumSingleBalance(balances, transform(Birds_Token_CONTRACT), collateralBalance)

  return balances;
}

module.exports = {
  bsc: {
    tvl,
  }
}; 