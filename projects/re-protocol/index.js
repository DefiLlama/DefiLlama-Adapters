const sdk = require('@defillama/sdk');
const ADDRESSES = require('../helper/coreAssets.json');
const { sumTokens2 } = require('../helper/unwrapLPs');

const CUSTODIAL_WALLETS = [
  '0x295f67fdb21255a3db82964445628a706fbe689e',
  '0x9ea38e09f41a9de53972a68268ba0dcc6d2fadf8',
  '0xd4374008c88321eb2e59abd311156c44b25831e9',
  '0x5c454f5526e41fbe917b63475cd8ca7e4631b147',
  '0x9ab62aebabe738ab233c447eedce88d1d0a61fe3',
  '0x19aff1c007397bdb7f82bda18151c28ab4335896',
  '0x802edbb1ec20548a4388abc337e4011718eb0291',
  '0xe1886be2ba8b2496c2044a77516f63a734193082',
  '0xb22a8533e6cd81598f82514a42f0b3161745fbe1',
  '0x4691c475be804fa85f91c2d6d0adf03114de3093',
  '0xfb602cb83c9c15b4cc49340dc9ad7a8c23754bb0',
  '0xe13292f97e38da0c64398de5e0bfc95180de9d23',
  '0xfd4016ea13ca8acc04a11a99702df076a4d3b852',
  '0x7d214438d0f27afccc23b3d1e1a53906ace5cfea',
]
const USDS = '0xdC035D45d973E3EC169d2276DDab16f1e407384F'

async function tvl(api) {
  const avaxApi = new sdk.ChainApi({ chain: 'avax', timestamp: api.timestamp })
  await avaxApi.getBlock()


  // Handle off-chain reserves
  const offChainData = await avaxApi.call({ abi: 'int256:latestAnswer', target: '0xc79a363a3f849d8b3F6A1932f748eA9d4fB2f607', });

  api.add(ADDRESSES.ethereum.USDC, offChainData / 100)

  // track on chain reserves
  return sumTokens2({
    api,
    owners: CUSTODIAL_WALLETS, // custodial wallets
    tokens: [
      ADDRESSES.null,
      ADDRESSES.ethereum.USDC,
      ADDRESSES.ethereum.DAI,
      ADDRESSES.ethereum.sUSDe,
      ADDRESSES.ethereum.USDT,
      ADDRESSES.ethereum.USDe,
      USDS,
    ]
  })
}

module.exports = {
  methodology: 'Value of the tokens in custodial wallets + off-chain assets tracked via oracle (tracked as USDC)',
  start: 1680307200, // April 1, 2023 - approximate protocol launch
  ethereum: { tvl }
};
