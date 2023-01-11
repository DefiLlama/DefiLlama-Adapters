const sdk = require('@defillama/sdk');
const { transformPolygonAddress } = require('../helper/portedTokens');
const USDCToken = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174';
const USDCHousePool = '0x14e849B39CA7De7197763b6254EE57eDBE0F3375';

async function tvl(timestamp, block, chainBlocks) {
  const balances = {};
  const transform = await transformPolygonAddress();

  const collateralBalance = (await sdk.api.abi.call({
    abi: 'erc20:balanceOf',
    chain: 'polygon',
    target: USDCToken,
    params: [USDCHousePool],
    block: chainBlocks['polygon'],
  })).output;

  sdk.util.sumSingleBalance(balances, transform(USDCToken), collateralBalance)

  return balances;
}

module.exports = {
  polygon: {
    tvl,
  }
}; // node test.js projects/mint-club/index.js