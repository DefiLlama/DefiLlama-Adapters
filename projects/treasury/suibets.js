const ADDRESSES = require('../helper/coreAssets.json')
const { getObject } = require("../helper/chain/sui");

const SUI_COIN = ADDRESSES.sui.SUI;
const SBETS_COIN = "0x999d696dad9e4684068fa74ef9c5d3afc411d3ba62973bd5d54830f324f29502::sbets::SBETS";
const BETTING_PLATFORM = "0xfed2649741e4d3f6316434d6bdc51d0d0975167a0dc87447122d04830d59fdf9";

async function tvl(api) {
  const platform = await getObject(BETTING_PLATFORM);
  const fields = platform.fields;
  api.add(SUI_COIN, fields.accrued_fees_sui);
}

async function ownTokens(api) {
  const platform = await getObject(BETTING_PLATFORM);
  const fields = platform.fields;
  api.add(SBETS_COIN, fields.accrued_fees_sbets);
}

module.exports = {
  timetravel: false,
  methodology: "Protocol-owned treasury: SUI and SBETS accrued as fees by the SuiBets BettingPlatform smart contract. SBETS is the protocol's own token.",
  sui: { tvl, ownTokens },
};
