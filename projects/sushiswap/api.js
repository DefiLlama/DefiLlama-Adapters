const { request, gql } = require("graphql-request");
const { toUSDTBalances } = require('../helper/balances');
const { getBlock } = require('../helper/getBlock')
const { getUniTVL } = require("../helper/unknownTokens")

const graphUrl = 'https://api.thegraph.com/subgraphs/name/zippoxer/sushiswap-subgraph-fork'
const graphQuery = gql`
query get_tvl($block: Int) {
  uniswapFactory(
    id: "0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac",
    block: { number: $block }
  ) {
    totalVolumeUSD
    totalLiquidityUSD
  }
}
`;

async function eth(timestamp, ethBlock, chainBlocks) {
  let block = ethBlock
  if(block === undefined){
    block = await getBlock(timestamp, 'ethereum', chainBlocks);
  }
  const { uniswapFactory } = await request(
    graphUrl,
    graphQuery,
    {
      block,
    }
  );
  const usdTvl = Number(uniswapFactory.totalLiquidityUSD)

  return toUSDTBalances(usdTvl)
}

const factory = '0xc35DADB65012eC5796536bD9864eD8773aBc74C4'

module.exports = {
  telos: {
    tvl: getUniTVL({
      factory,
      chain: 'telos',
      coreAssets: [
        '0xD102cE6A4dB07D247fcc28F366A623Df0938CA9E', // telos
        "0xfA9343C3897324496A05fC75abeD6bAC29f8A40f", //weth
        "0xf390830df829cf22c53c8840554b98eafc5dcbc2", //btc
        "0x818ec0A7Fe18Ff94269904fCED6AE3DaE6d6dC0b", //usdc
        "0xeFAeeE334F0Fd1712f9a8cc375f427D9Cdd40d73", //usdt
      ]
    }),
  },
  palm: {
    tvl: getUniTVL({
      factory,
      chain: 'palm',
      coreAssets: [
        '0x4c1f6fcbd233241bf2f4d02811e3bf8429bc27b8', // dai
      ]
    }),
  },
  moonriver: {
    tvl: getUniTVL({
      factory,
      chain: 'moonriver',
      coreAssets: [
        '0xf50225a84382c74CbdeA10b0c176f71fc3DE0C4d', // moonriver
        "0xb44a9b6905af7c801311e8f4e76932ee959c663c", // usdt
        "0xe3f5a90f9cb311505cd691a46596599aa1a0ad7d", // usdc
        "0x639a647fbe20b6c8ac19e48e2de44ea792c62c5c", // eth
      ]
    }),
  },
  celo: {
    tvl: getUniTVL({
      factory,
      chain: 'celo',
      coreAssets: [
        '0x471ece3750da237f93b8e339c536989b8978a438', // celo
        "0x765de816845861e75a25fca122bb6898b8b1282a", //cUSD
      ]
    }),
  },
  okexchain: {
    tvl: getUniTVL({
      factory,
      chain: 'okexchain',
      coreAssets: [
        '0x382bb369d343125bfb2117af9c149795c6c65c50', // tether
        "0xc946daf81b08146b1c7a8da2a851ddf2b3eaaf85", // usdc
        "0x8f8526dbfd6e38e3d8307702ca8469bae6c56c15", // wokt
      ]
    }),
  },
  arbitrum: {
    tvl: getUniTVL({
      factory,
      chain: 'arbitrum',
      coreAssets: [
        '0x82af49447d8a07e3bd95bd0d56f35241523fbab1', // ETH
        "0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f", // wbtc
        "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8", // usdc
        "0xf97f4df75117a78c1a5a0dbb814af92458539fb4", // link
        "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9", // usdt
      ]
    }),
  },
  xdai: {
    tvl: getUniTVL({
      factory,
      chain: 'xdai',
      coreAssets: [
        '0xe91d153e0b41518a2ce8dd3d7944fa863463a97d', // WXDAI
        '0xddafbb505ad214d7b80b1f830fccc89b60fb7a83', // USDC
      ]
    })
  },
  harmony:{
    tvl: getUniTVL({
      factory,
      chain: 'harmony',
      coreAssets: [
        '0x6983D1E6DEf3690C4d616b13597A09e6193EA013', // WETH
        '0xcF664087a5bB0237a0BAd6742852ec6c8d69A27a', // WHARMONY
        '0x985458e523db3d53125813ed68c274899e9dfab4', // USDC
        '0x3c2b8be99c50593081eaa2a724f0b8285f5aba8f', // USDT
        '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1', // DAI
      ],
      blacklist: [
        '0xed0b4b0f0e2c17646682fc98ace09feb99af3ade', // RVRS
      ]
    })
  },
  ethereum: {
    tvl: eth,
  },
  polygon: {
    tvl: getUniTVL({
      factory,
      chain: 'polygon',
      coreAssets: [
        '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270', // WMATIC
        '0x2791bca1f2de4661ed88a30c99a7a9449aa84174', // USDC
        '0xc2132d05d31c914a87c6611c10748aeb04b58e8f', // USDT
        '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063', // DAI
      ],
    }),
  },
  fantom: {
    tvl: getUniTVL({
      factory,
      chain: 'fantom',
      coreAssets: [
        '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83', // wftm
        '0x04068da6c83afcfa0e13ba15a6696662335d5b75', // USDC
        '0x049d68029688eabf473097a2fc38ef61633a3c7a', // USDT
        '0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e', // DAI
      ],
    }),
  },
  bsc: {
    tvl: getUniTVL({
      factory,
      chain: 'bsc',
      coreAssets: [
        '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', // wbnb
        '0xe9e7cea3dedca5984780bafc599bd69add087d56', // busd
        '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d', // USDC
        '0x55d398326f99059ff775485246999027b3197955', // USDT
        '0x2170ed0880ac9a755fd29b2688956bd959f933f8', // ETH
      ],
      blacklist: [
        '0x00598f74DA03489d4fFDb7Fde54db8E3D3AA9a61', // GSHIB
        '0xE38928cd467AD7347465048b3637893124187d02', // GSHIB
        '0xc0e39cbac6a5c5cdcdf2c1a1c29cbf5917754943', // GSHIB
      ]
    }),
  },
  heco:{
    tvl: getUniTVL({
      factory,
      chain: 'heco',
      coreAssets: [
        '0x5545153ccfca01fbd7dd11c0b23ba694d9509a6f', // wheco
      ],
    }),
  },
  avax:{
    tvl: getUniTVL({
      factory,
      chain: 'avax',
      coreAssets: [
        '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7', // wavax
        '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e', // USDC
        '0xc7198437980c041c805a1edcba50c1ce5db95118', // USDT
      ],
    }),
  },
  fuse:{
    tvl: getUniTVL({
      factory: '0x43eA90e2b786728520e4f930d2A71a477BF2737C',
      chain: 'fuse',
      coreAssets: [
        '0x0be9e53fd7edac9f859882afdda116645287c629', // wfuse
        "0x620fd5fa44BE6af63715Ef4E65DDFA0387aD13F5", //usdc
        "0xa722c13135930332Eb3d749B2F0906559D2C5b99", //weth
      ],
    }),
  },
}
