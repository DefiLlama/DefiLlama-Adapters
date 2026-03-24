const { getUniTVL, sumTokensExport } = require('@defillama/sdk');

const OSAK = {
  ethereum:  '0xa21af1050f7b26e0cff45ee51548254c41ed6b5c',
  base:      '0xbfd5206962267c7b4b4a8b3d76ac2e1b2a5c4d5e',
  arbitrum:  '0xbfd5206962267c7b4b4a8b3d76ac2e1b2a5c4d5e',
  optimism:  '0xbfd5206962267c7b4b4a8b3d76ac2e1b2a5c4d5e',
  bsc:       '0x11cd72f7A4B699c67f225ca8aBb20bC9F8DB90c7',
  polygon:   '0x11cd72f7A4B699c67f225ca8aBb20bC9F8DB90c7',
  avalanche: '0x96E1056a8814De39c8c3Cd0176042d6ceCD807d7',
};

// LP tokens farms
const lpTokens = {
  base:      '0x086903c53057c96582b3075e3c0b1b570574a8fe',
  arbitrum:  '0xE67c34d25D9CA2Fc41824184309C6Fce9B0558c5',
  bsc:       '0x61F7620a747111678c5Fe83d822a0afd060Ba0F7',
  avalanche: '0xE67c34d25D9CA2Fc41824184309C6Fce9B0558c5',
  polygon:   '0xE67c34d25D9CA2Fc41824184309C6Fce9B0558c5',
  optimism:  '0x61F7620a747111678c5Fe83d822a0afd060Ba0F7',
};

const factories = {
  ethereum:  '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f', // Uniswap V2 (nie używany w LP, ale zostawiamy na wszelki)
  base:      '0x8909Dc15e40173Ff4699343b6eB8132c65e18eC6', // Uniswap V2 Base
  arbitrum:  '0xf1D7CC64Fb4452F05c498126312eBE29f30Fbcf9', // Uniswap V2 Arbitrum
  optimism:  '0x0c3c1c532F1e39EdF36BE9Fe0bE1410313E074Bf', // Uniswap V2 Optimism
  polygon:   '0x9e5A52f57b3038F1B8EeE45F28b3C1967e22799C', // Uniswap V2 Polygon
  bsc:       '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73', // PancakeSwap V2
  avalanche: '0x9Ad6C38BE94206cA50bb0d90783181662f0Cfa10', // Trader Joe V1
};

module.exports = {
  misrepresentedTokens: true,
  methodology: `TVL counts $OSAK tokens locked across chains + value of OSAK LP tokens staked in farms at farms.osaka.win`,

  // Locked $OSAK (single token)
  ethereum:  { tvl: sumTokensExport({ owners: [OSAK.ethereum], tokens: [OSAK.ethereum] }) },
  base:      { tvl: sumTokensExport({ owners: [OSAK.base],      tokens: [OSAK.base] }) },
  arbitrum:  { tvl: sumTokensExport({ owners: [OSAK.arbitrum],  tokens: [OSAK.arbitrum] }) },
  optimism:  { tvl: sumTokensExport({ owners: [OSAK.optimism],  tokens: [OSAK.optimism] }) },
  bsc:       { tvl: sumTokensExport({ owners: [OSAK.bsc],       tokens: [OSAK.bsc] }) },
  polygon:   { tvl: sumTokensExport({ owners: [OSAK.polygon],   tokens: [OSAK.polygon] }) },
  avalanche: { tvl: sumTokensExport({ owners: [OSAK.avalanche], tokens: [OSAK.avalanche] }) },

  // LP Farms value
  base:      { tvl: getUniTVL({ factory: factories.base,      chain: 'base',      useDefaultCoreAssets: true }) },
  arbitrum:  { tvl: getUniTVL({ factory: factories.arbitrum,  chain: 'arbitrum',  useDefaultCoreAssets: true }) },
  optimism:  { tvl: getUniTVL({ factory: factories.optimism,  chain: 'optimism',  useDefaultCoreAssets: true }) },
  polygon:   { tvl: getUniTVL({ factory: factories.polygon,   chain: 'polygon',   useDefaultCoreAssets: true }) },
  bsc:       { tvl: getUniTVL({ factory: factories.bsc,       chain: 'bsc',       useDefaultCoreAssets: true }) },
  avalanche: { tvl: getUniTVL({ factory: factories.avalanche, chain: 'avalanche', useDefaultCoreAssets: true }) },
};
