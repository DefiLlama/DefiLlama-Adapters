const sdk = require('@defillama/sdk');

const suncAddress = '0x692aCCdD8b86692427E0aa4752AE917Df01CC56F';
const lpWethSunc = '0xaf5a7469cf2571b973aeee9ae2f8aad00e1337d2';
const stakingAddress = '0x7dbE40ac6bB41A5FE4Fa2C74f31d7DEFBC793B58';

async function tvl(timestamp, block) {
  let balances = {};

  const results = await sdk.api.abi.multiCall({
    block,
    abi: 'erc20:balanceOf',
    calls: [
      {
        target: suncAddress,
        params: [lpWethSunc]
      },
      {
        target: suncAddress,
        params: [stakingAddress]
      }
    ]
  })
  sdk.util.sumMultiBalanceOf(balances, results);

  return balances
}

module.exports = {
  ethereum: {
    tvl,
  },
  tvl
}