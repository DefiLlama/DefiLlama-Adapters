const { sumTokensExport } = require("../helper/unwrapLPs");

module.exports = {
  methodology: "Counts all tokens (ARY, CRO, and other CRC-20s) held by ZenStake, ZenRecharge, and ZenSwap contracts.)
  cronos: {
    tvl: sumTokensExport({ 
      owners: [
        '0x620B2367E630430C615ccF5CA02084c11995Fe25', // ZenStake v2.0
        '0xD39e62C0FFb6653BDE0f8f456E9624BF64216126', // ZenRecharge v4.0  
        '0xEB401e50e30E770222bDeA6CA6938B237De1f3f9', // ZenSwap v3.0
      ],
      fetchCoValentTokens: true, // Automatically fetch all ERC-20 tokens
      tokens: [
        '0x0000000000000000000000000000000000000000', // Native CRO
      ],
    }),
  }
};
