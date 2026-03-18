const sdk = require('@defillama/sdk');
const ADDRESSES = require('../helper/coreAssets.json');
const { sumTokens2 } = require('../helper/unwrapLPs');

async function tvl(api) {
  const avaxApi = new sdk.ChainApi({ chain: 'avax', timestamp: api.timestamp })
  await avaxApi.getBlock()


  // Handle off-chain reserves
  const offChainData = await avaxApi.call({ abi: 'int256:latestAnswer', target: '0xc79a363a3f849d8b3F6A1932f748eA9d4fB2f607', });

  api.add(ADDRESSES.ethereum.USDC, offChainData / 100)

  // track on chain reserves
  return sumTokens2({
    api,
    owner: '0x295f67fdb21255a3db82964445628a706fbe689e', // custodial wallet
    tokens: [
      ADDRESSES.null,
      ADDRESSES.ethereum.USDC,
      ADDRESSES.ethereum.sUSDe,
      ADDRESSES.ethereum.USDT,
      ADDRESSES.ethereum.USDe,
    ]
  })
}

module.exports = {
  methodology: 'Value of the tokens in the custodian wallet + off-chain assets tracked via oracle (tracked as USDC)',
  start: 1680307200, // April 1, 2023 - approximate protocol launch
  ethereum: { tvl }
};
