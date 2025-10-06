const CHAINS = [
  'ethereum', 'base', 'optimism', 'arbitrum', 'polygon', 'avalanche', 'bsc',
  'scroll', 'mantle', 'linea', 'zksync', 'taiko', 'blast', 'mode', 'zora', 'metis',
  'cronos', 'celo', 'gnosis', 'conflux', 'ronin', 'lisk',
  'berachain', 'kaia', 'core', 'redstone', 'cyber', 'story', 'morph', 'zircuit',
  'apechain', 'ancient8', 'degen', 'botanix', 'mezo', 'bob',
  'abstract', 'soneium', 'ink', 'unichain', 'plume', 'gravity', 'sonic', 'manta',
];

const chainExports = Object.fromEntries(CHAINS.map((c) => [c, { tvl: () => ({}) }]));

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: 'Business metrics (fees/revenue) are displayed through a separate fees adapter',
  hallmarks: [
    [1754265600, 'Public launch'],            
    [1754870400, 'Base mainnet contract'],
  ],
  start: 1754870400, // earliest on-chain activity for GM (Base deploy)
  ...chainExports,
}
