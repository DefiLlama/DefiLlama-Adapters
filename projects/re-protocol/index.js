const sdk = require('@defillama/sdk');
const ADDRESSES = require('../helper/coreAssets.json');
const { sumTokens2 } = require('../helper/unwrapLPs');

const config = {
  ethereum: {
    owners: [
      '0x295f67fdb21255a3db82964445628a706fbe689e', // reUSD custodial wallet
      '0xd4374008c88321Eb2e59ABD311156C44B25831e9', // reUSDe custodial wallet
      '0x9eA38e09F41A9DE53972a68268BA0Dcc6d2fAdf8', // redemptions wallet
      '0x5C454f5526e41fBE917b63475CD8CA7E4631B147', // redemption contract
      '0x4691C475bE804Fa85f91c2D6D0aDf03114de3093', // reUSD contract
      '0xE1886BE2bA8B2496c2044a77516F63a734193082', // reUSDe contract
    ],
    tokens: [ADDRESSES.ethereum.USDC, ADDRESSES.ethereum.sUSDe, ADDRESSES.ethereum.USDT, ADDRESSES.ethereum.USDe, ADDRESSES.ethereum.USDS],
  },
  avax: {
    owners: [
      '0x295F67Fdb21255A3Db82964445628a706FBe689E', // reUSD custodial wallet
      '0x4F1ff9b995472B27A6BAfEc967986F35Bf1aDaE4', // redemptions wallet
      '0xe13292F97E38da0C64398De5E0bFc95180DE9d23', // redemptions contract
      '0xb22a8533e6cd81598f82514a42F0B3161745fbe1', // reUSD contract
    ],
    tokens: [ADDRESSES.avax.USDC, ADDRESSES.avax.USDe, ADDRESSES.avax.sUSDe, ADDRESSES.avax.USDt],
  },
  arbitrum: {
    owners: [
      '0x295F67Fdb21255A3Db82964445628a706FBe689E', // reUSD custodial wallet
      '0xfB602cb83c9c15b4cc49340dc9aD7a8C23754BB0', // redemptions wallet
      '0xfd4016Ea13ca8acc04A11a99702dF076A4d3B852', // redemptions contract
      '0x802eDbB1Ec20548A4388ABC337E4011718eb0291', // reUSD contract
    ],
    tokens: [ADDRESSES.arbitrum.USDC, ADDRESSES.arbitrum.USDC_CIRCLE, ADDRESSES.arbitrum.USDe, ADDRESSES.arbitrum.sUSDe, ADDRESSES.arbitrum.USDT],
  },
  base: {
    owners: [
      '0x295F67Fdb21255A3Db82964445628a706FBe689E', // reUSD custodial wallet
      '0x19aff1C007397Bdb7f82BdA18151C28AB4335896', // redemptions wallet
      '0x9AB62AebAbE738AB233C447eEdCE88D1D0a61FE3', // redemptions contract
      '0x7D214438D0F27AfCcC23B3d1e1a53906aCE5CFEa', // reUSD contract
    ],
    tokens: [ADDRESSES.base.USDC, ADDRESSES.base.USDe, ADDRESSES.base.sUSDe, ADDRESSES.base.USDT],
  },
}

async function tvl(api) {
  if (api.chain === 'ethereum') {
    const avaxApi = new sdk.ChainApi({ chain: 'avax', timestamp: api.timestamp })
    await avaxApi.getBlock()
    const offChainData = await avaxApi.call({ abi: 'int256:latestAnswer', target: '0xc79a363a3f849d8b3F6A1932f748eA9d4fB2f607' })
    api.add(ADDRESSES.ethereum.USDC, offChainData / 100)
  }
  const { owners, tokens } = config[api.chain]
  return sumTokens2({ api, owners, tokens: [ADDRESSES.null, ...tokens] })
}

module.exports = {
  methodology: 'Value of the tokens in the custodian wallets + value of the tokens in redemption reserves + off-chain assets tracked via oracle (tracked as USDC)',
  start: 1737488963, // reUSD Deployment time (https://etherscan.io/tx/0x3094948b3dbe89f4824217e37b8667fbb4d89e18b0b426a453fe7377095c26ea)
}

Object.keys(config).forEach(chain => { module.exports[chain] = { tvl } })
