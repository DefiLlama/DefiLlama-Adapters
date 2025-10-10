const { sumTokensExport } = require("../helper/unwrapLPs");

module.exports = {
  methodology: "Counts all tokens held by ZenStake, ZenRecharge, and ZenSwap contracts.",
  cronos: {
    tvl: sumTokensExport({ 
      owners: [
        "0x620B2367E630430C615ccF5CA02084c11995Fe25",
        "0xD39e62C0FFb6653BDE0f8f456E9624BF64216126",
        "0xEB401e50e30E770222bDeA6CA6938B237De1f3f9"
      ],
      fetchCoValentTokens: true,
      tokens: [
        "0x0000000000000000000000000000000000000000"
      ]
    })
  }
};
