const { getObject } = require("../helper/chain/sui");

const BETTING_PLATFORM = "0xfed2649741e4d3f6316434d6bdc51d0d0975167a0dc87447122d04830d59fdf9";
const SUI_COIN = "0x2::sui::SUI";
const SBETS_COIN = "0x999d696dad9e4684068fa74ef9c5d3afc411d3ba62973bd5d54830f324f29502::sbets::SBETS";

async function tvl(api) {
  const platform = await getObject(BETTING_PLATFORM);
  const fields = platform.fields;
  const totalSui = BigInt(fields.treasury_sui) + BigInt(fields.accrued_fees_sui);
  const totalSbets = BigInt(fields.treasury_sbets) + BigInt(fields.accrued_fees_sbets);
  api.add(SUI_COIN, totalSui.toString());
  api.add(SBETS_COIN, totalSbets.toString());
}

module.exports = {
  methodology: "TVL is the sum of SUI and SBETS tokens locked in the SuiBets BettingPlatform smart contract on Sui mainnet, including treasury reserves and accrued platform fees.",
  sui: {
    tvl,
  },
};
