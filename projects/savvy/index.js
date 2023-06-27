const { sumTokensExport } = require('../helper/unwrapLPs')

module.exports = {
  methodology: 'The calculated TVL is the current USD sum of all user deposits and SVY tokens staked in veSVY.',
  arbitrum: {
    tvl: sumTokensExport({
      tokensAndOwners: [
        ['0x078f358208685046a11c85e8ad32895ded33a249', '0xDD7e69c478288A9596DECc2230A39c7b922413Dd'], // aArbWBTC
        ['0xe50fA9b3c56FfB159cB0FCA61F5c9D750e8128c8', '0xCaB3886D48bAd0F749ba7e7c7A255b636c64F937'], // aArbWETH
        ['0x625e7708f30ca75bfd92586e17077590c60eb4cd', '0xCdFF8576683E22621f512fc2E6d347A9D241DAd3'], // aArbUSDC
      ]
    }),
    staking: sumTokensExport({ owners: ['0x9aEEe4656F67034B06D99294062feBA1015430ad', '0xbf837f2C7894cfF859a01d078d7AAa8c47221a2F'], tokens: ['0x43ab8f7d2a8dd4102ccea6b438f6d747b1b9f034'] }),
  }
}