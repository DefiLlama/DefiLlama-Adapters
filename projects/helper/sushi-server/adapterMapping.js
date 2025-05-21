module.exports = {
  hourlyRun: [
    [
      {
        'fxdao': '/fxdao/api.js',
        // 'blend-pools': '/blend-pools/api.js',  // moved to rpc proxy
        // 'blend-pools-v2': '/blend-pools-v2/api.js',  // moved to rpc proxy
        // 'blend-backstop': '/blend-backstop/api.js',  // moved to rpc proxy
        // 'blend-backstop-v2': '/blend-backstop-v2/api.js',  // moved to rpc proxy
        'harvest': '/harvest.js',
        'astar-dapps-staking': '/astar-dapps-staking/api',
        'hydradex-v3': '/hydradex-v3/index.js',
        'injective-orderbook': '/injective-orderbook/api',
        'lisa': '/lisa/api',
      },
      {
        'bifrost-staking': '/bifrost-staking/api',
        'bifrost-dex': '/bifrost-dex/api',
        'bifrost-liquid-crowdloan': '/bifrost-liquid-crowdloan/api',
      },
      {
        // 'genshiro': '/genshiro/api',
        // 'streamflow': '/streamflow/index',
      },
      {
        'interlay-btc': '/interlay-btc/api',
        'interlay-staking': '/interlay-staking/api',
        'interlay-collateral': '/interlay-collateral/api',
        'interlay-dex': '/interlay-dex/api',
        'interlay-lending': '/interlay-lending/api',
      },
    ],
    [
      {
        // 'parallel-staking': '/parallel-staking/api',
        // 'parallel-crowdloan': '/parallel-crowdloan/api',
        // 'parallelamm': '/parallelamm/api',
        // 'parallel-lending': '/parallel-lending/api',
        // 'parallel-stream': '/parallel-stream/api',
        'manta-atlantic-stake': '/manta-atlantic-stake/api',
        'mantadex': '/mantadex/api',
      },
      {
        'acala-staking': '/acala-staking/api',
        'acala-lcdot': '/acala-lcdot/api',
        'tapio': '/tapio/api',
        'acala-lending': '/acala-lending/api',
        'acala-dex': '/acala-dex/api',
      },
      {
        'polkadex': '/polkadex/api',
      },
      {
        'karura-lending': '/karura-lending/api',
        'karura-staking': '/karura-staking/api',
        'taiga': '/taiga/api',
        'karura-dex': '/karura-dex/api',
      },
      {
        'kintsugi': '/kintsugi/api',
        'jewelswap-lev-farming': '/jewelswap-lev-farming/index',
        'jewelswap-nft': '/jewelswap-nft/index',

      },
      {
        'hydradx': '/hydradx/api',
      },
      {
        'newbitcoin': '/newbitcoin/index',
        'nemoswap': '/nemoswap/index',
        'stackingdao': '/stackingdao/api',
        'stacks': '/stacks/api',
      },
    ],
  ],
  bulky: [
    [{
      // 'quantumx-network': '/quantumx-network/index',
      'polkadot': '/treasury/polkadot-api',
      'stackswap': '/stackswap/api',
      'velar-amm': '/velar-amm/api',
      'alexlab': '/alexlab/api',
      'satoshi-dex': '/satoshi-dex/api',
      'raydium': '/raydium/index',
      'vitcswap': '/vitcswap/api',
      'defichain-loans': '/defichain-loans',
      // 'kamino': '/kamino/api',
      // '1inch': '/1inch/apiCache',
      'izumi': '/izumi/api',
      // 'summer-fi': '/summer-fi/index',
      // 'sunswap-v2': '/sunswap-v2/index',
      unicrypt: '/unicrypt/apiCache',
      deeplock: '/deeplock/apiCache',
      pinksale: '/pinksale/apiCache',
      'team-finance': '/team-finance/apiCache',
      synthetix: '/synthetix/apiCache',
      dxsale: '/dxsale/apiCache',
      blum: '/blum/api',
      'yodeswap': '/yodeswap/api',
      'dogeswap-org': '/dogeswap-org/api',

      // breaks often
      // 'equilibrium': '/equilibrium/api',
      'hydradex': '/hydradex.js',

      // chain down?
      // 'parallel-staking': '/parallel-staking/api',
      // 'parallel-crowdloan': '/parallel-crowdloan/api',
      // 'parallelamm': '/parallelamm/api',
      // 'parallel-lending': '/parallel-lending/api',
      // 'parallel-stream': '/parallel-stream/api',
    }],
  ],
}
