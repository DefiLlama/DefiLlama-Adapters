const { stakings } = require("../helper/staking");

const ZENSTAKE_CONTRACT = "0x620B2367E630430C615ccF5CA02084c11995Fe25";
const ZENRECHARGE_CONTRACT = "0xD39e62C0FFb6653BDE0f8f456E9624BF64216126";
const ARY_TOKEN = "0x41bc026dABe978bc2FAfeA1850456511ca4B01bc";

async function tvl(api) {
  await api.sumTokens({ 
    owners: [ZENRECHARGE_CONTRACT],
    resolveLP: true,
  });
}

module.exports = {
  methodology: "ZenFinance TVL includes ARY staked in ZenStake and ZenRecharge contracts, plus other tokens in ZenRecharge",
  start: 1726238297, // Sep 13, 2025 - ZenStake deployment date
  cronos: {
    tvl,
    staking: stakings([ZENSTAKE_CONTRACT, ZENRECHARGE_CONTRACT], ARY_TOKEN),
  }
};
