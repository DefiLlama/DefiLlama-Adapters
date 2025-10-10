const { sumTokensExport } = require("../helper/unwrapLPs");

module.exports = {
  methodology: "Counts ARY tokens and CRO held by ZenStake, ZenRecharge, and ZenSwapAuto contracts using sumTokens helper.",
  cronos: {
    tvl: sumTokensExport({ 
      owners: [
        '0x51938b2fa093CB49e3820026c7c2A76c46576693', // ZenStake
        '0x47823ADe2A040606A9B2e4447b0aA2C9940B8018', // ZenRecharge  
        '0x468414aa83Af8d9e98C13da86fc28e5ccc6d6508', // ZenSwapAuto
      ],
      tokens: [
        '0x41bc026dABe978bc2FAfeA1850456511ca4B01bc', // ARY token
        '0x0000000000000000000000000000000000000000', // Native CRO
      ],
    }),
  }
};
