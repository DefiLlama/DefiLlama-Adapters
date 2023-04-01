const { get } = require('../helper/http');
const blacklistedAssets = ['uaxl'];

const chainMapping = {
    avax: 'avalanche',
    cosmos: 'cosmoshub',
    terra2: 'terra-2',
    bsc: 'binance'
  };

  const assetChainMap = {
    'uusdc': 'ethereum',
    'weth-wei': 'ethereum',
    'wbtc-satoshi': 'ethereum',
    'dai-wei': 'ethereum',
    'uusdt': 'ethereum',
    'wbnb-wei': 'binance', 
    'dot-planck': 'moonbeam',
    'wmatic-wei': 'polygon',
    'uluna': 'terra',
    'wavax-wei': 'avalanche',
    'uusd': 'terra',
    'wftm-wei': 'fantom',
    'busd-wei': 'ethereum',
    'uatom': 'cosmoshub',
    'link-wei': 'ethereum',
    'polygon-uusdc': 'polygon',
    'mkr-wei': 'ethereum',
    'frax-wei': 'ethereum',
    'eth-wei': 'ethereum',
    'shib-wei': 'ethereum',
    'wglmr-wei': 'moonbeam',
    'stuatom': 'stride',
    'steth-wei': 'ethereum',
    'aave-wei': 'ethereum',
    'uni-wei': 'ethereum',
    'ustrd': 'stride',
    'rai-wei': 'ethereum',
    'ape-wei': 'ethereum',
    'ujuno': 'juno'
  }

const chainListSupply = ['juno', 'cosmos', 'comdex', 'carbon', 'crescent', 'injective', 'kujira', 'osmosis',
'persistence', 'stargaze', 'secret', 'stargaze', 'umee', 'evmos', 'terra2'];
const chainListTotal = [ 'avax', 'bsc', 'moonbeam', 'polygon', 'fantom', 'arbitrum', 'aurora', 'celo', 'kava',
];

  async function getTVL(chain) {
    const { data } = await get('https://api.axelarscan.io/cross-chain/tvl');
    const mappedChain = chainMapping[chain] || chain;
  
    return data.reduce((tvl, asset) => {
      // Skip the asset if it is on the blacklisted chain specified in the assetChainMap
      if (assetChainMap[asset.asset] === mappedChain) return tvl;
      if (blacklistedAssets.includes(asset.asset)) return tvl;
      const chainData = asset.tvl[mappedChain];
      if (!chainData) return tvl;
  
      let assetAmount;
  
      if (chainListSupply.includes(chain)) {
        assetAmount = chainData.supply;
      } else if (chainListTotal.includes(chain)) {
        assetAmount = chainData.total;
      } else {
        return tvl;
      }
  
      const assetPrice = asset.price;
  
      // Check if both assetAmount and assetPrice are numbers
      if (isNaN(assetAmount) || isNaN(assetPrice)) return tvl;
  
      return tvl + (assetAmount * assetPrice);
    }, 0);
  }
  
  const exportObj = {};
  
  chainListSupply.concat(chainListTotal).forEach(chain => {
    exportObj[chain] = { tvl: () => getTVL(chain).then(tether => ({ tether })) };
  });
  
  module.exports = exportObj;
  module.exports.misrepresentedTokens = true;
  module.exports.timetravel = false;