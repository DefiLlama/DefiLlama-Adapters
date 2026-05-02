const ADDRESSES = require("../helper/coreAssets.json");
const sui = require("../helper/chain/sui");

const GGSUI_VAULT = "0xcf56db67c7cb84433781ceb1445d99ad8c4f6e36f8276a95590c52ad7b156fce";

async function tvl(api) {
  const vault = await sui.getObject(GGSUI_VAULT);
  const totalSui =
    BigInt(vault.fields.total_sui_supply) +
    BigInt(vault.fields.sui_to_stake) +
    BigInt(vault.fields.addon_staking_rewards) +
    BigInt(vault.fields.unstaked_sui_reserve);
  api.add(ADDRESSES.sui.SUI, totalSui.toString());
}

module.exports = {
  timetravel: false,
  methodology: "TVL is the total SUI staked in the HoneyPlay ggSUI liquid staking vault.",
  sui: { tvl },
};
