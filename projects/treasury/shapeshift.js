const { treasuryExports } = require("../helper/treasury");

const evm_addresses = [
  '0x90a48d5cf7343b08da12e067680b4c6dbfe551be',
  '0x6268d07327f4fb7380732dc6d63d95f88c0e083b',
  '0x74d63f31c2335b5b3ba7ad2812357672b2624ced',
  '0xb5f944600785724e31edb90f9dfa16dbf01af000',
  '0xb0e3175341794d1dc8e5f02a02f9d26989ebedb3',
  '0x8b92b1698b57bedf2142297e9397875adbb2297e',
  '0x38276553f8fbf2a027d901f8be45f00373d8dd48',
  '0x5c59d0ec51729e40c413903be6a4612f4e2452da',
  '0x9c9aa90363630d4ab1d9dbf416cc3bbc8d3ed502',
];

const EVM_CHAINS = ['ethereum', 'arbitrum', 'bsc', 'xdai', 'polygon', 'avax', 'optimism'];

const EVM_OWN_TOKENS = {
  ethereum: [
    '0x470e8de2eBaef52014A47Cb5E6aF86884947F08c',
    '0xc770EEfAd204B5180dF6a14Ee197D99d808ee52d',
    '0x808D3E6b23516967ceAE4f17a5F9038383ED5311',
  ],
  arbitrum: ['0xf929de51d91c77e42f5090069e0ad7a09e513c73'],
  xdai: ['0x21a42669643f45bc0e086b8fc2ed70c23d67509d'],
  polygon: ['0x65a05db8322701724c197af82c9cae41195b0aa8'],
  optimism: ['0xf1a0da3367bc7aa04f8d94ba57b862ff37ced174'],
};

const CONFIG = Object.fromEntries([
  ...EVM_CHAINS.map((chain) => [
    chain,
    EVM_OWN_TOKENS[chain]
      ? { owners: evm_addresses, ownTokens: EVM_OWN_TOKENS[chain] }
      : { owners: evm_addresses },
  ]),
  ['solana', { owners: ['C7RTJbss7R1r7j8NUNYbasUXfbPJR99PMhqznvCiU43N'] }],
  ['cosmos', { owners: ['cosmos1hmpklv86wmkj8y8k2dd4wd6rcwln6und7v0s92'] }],
]);

const exportConfig = Object.fromEntries(
  Object.entries(CONFIG).map(([chain, cfg]) => [
    chain,
    cfg.ownTokens ? { owners: cfg.owners, ownTokens: cfg.ownTokens } : { owners: cfg.owners },
  ])
);

module.exports = treasuryExports({
  isComplex: false,
  ...exportConfig,
});
