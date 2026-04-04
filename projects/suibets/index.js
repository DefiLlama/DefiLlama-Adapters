const { getObject } = require("../helper/chain/sui");

const BETTING_PLATFORM = "0xfed2649741e4d3f6316434d6bdc51d0d0975167a0dc87447122d04830d59fdf9";
const CETUS_SBETS_SUI_POOL = "0xa809b51ec650e4ae45224107e62787be5e58f9caf8d3f74542f8edd73dc37a50";
const SUI_COIN = "0x2::sui::SUI";

async function tvl(api) {
  const [platform, pool] = await Promise.all([
    getObject(BETTING_PLATFORM),
    getObject(CETUS_SBETS_SUI_POOL),
  ]);

  const fields = platform.fields;
  const totalSui = BigInt(fields.treasury_sui) + BigInt(fields.accrued_fees_sui);
  const totalSbets = BigInt(fields.treasury_sbets) + BigInt(fields.accrued_fees_sbets);

  api.add(SUI_COIN, totalSui.toString());

  const poolSbets = BigInt(pool.fields.coin_a);
  const poolSui = BigInt(pool.fields.coin_b);
  if (poolSbets > 0n) {
    const sbetsValueInSui = totalSbets * poolSui / poolSbets;
    api.add(SUI_COIN, sbetsValueInSui.toString());
  }
}

module.exports = {
  misrepresentedTokens: true,
  methodology: "TVL is the total value locked in the SuiBets BettingPlatform smart contract on Sui mainnet. SUI is counted directly. SBETS value is derived from the on-chain Cetus DEX SBETS/SUI pool price.",
  sui: {
    tvl,
  },
};
