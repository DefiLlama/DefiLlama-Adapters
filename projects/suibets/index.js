const { getObject } = require("../helper/chain/sui");

  const SUI_COIN = "0x2::sui::SUI";
  const SBETS_COIN = "0x999d696dad9e4684068fa74ef9c5d3afc411d3ba62973bd5d54830f324f29502::sbets::SBETS";
  const BETTING_PLATFORM = "0xfed2649741e4d3f6316434d6bdc51d0d0975167a0dc87447122d04830d59fdf9";

  async function tvl(api) {
    const platform = await getObject(BETTING_PLATFORM);
    const fields = platform.fields;
    const totalSui = BigInt(fields.treasury_sui) + BigInt(fields.accrued_fees_sui);
    api.add(SUI_COIN, totalSui.toString());
  }

  async function staking(api) {
    const platform = await getObject(BETTING_PLATFORM);
    const fields = platform.fields;
    const totalSbets = BigInt(fields.treasury_sbets) + BigInt(fields.accrued_fees_sbets);
    api.add(SBETS_COIN, totalSbets.toString());
  }

  module.exports = {
    timetravel: false,
    methodology: "TVL is the SUI locked in the SuiBets BettingPlatform smart contract. SBETS held in the platform are reported under staking.",
    sui: { tvl, staking },
  };
  