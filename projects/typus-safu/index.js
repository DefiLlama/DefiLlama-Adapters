const sui = require("../helper/chain/sui");

const SAFU_REGISTRY = "0xdc970d638d1489385e49ddb76889748011bac4616b95a51aa63633972b841706";
const FUNDING_VAULT_REGISTRY = "0xeb9e1c94b72cd3e1a4ca2e4d6e9dd61547c0c45c654843e0db03c50ba3c21138";
const HEDGE_VAULT_REGISTRY = "0x515bb299ca2f0c8b753411f6e52322c03516915f522096890a314adac6c39a0a";

async function tvl(api) {
  // Safu Vaults
  const fields = await sui.getDynamicFieldObjects({
    parent: SAFU_REGISTRY,
  });
  const safuVaults = fields.filter((item) => item.type.includes("Vault"));

  safuVaults.forEach(({ fields }) => {
    const deposit_token = "0x" + fields.deposit_token.fields.name;
    api.add(deposit_token, fields.share_supply.slice(0, 4));
  });

  // Safu Funding Vults
  const fields2 = await sui.getDynamicFieldObjects({
    parent: FUNDING_VAULT_REGISTRY,
  });
  const safuFundingVaults = fields2.filter((item) => item.type.includes("Vault"));

  safuFundingVaults.forEach(({ fields }) => {
    const deposit_token = "0x" + fields.token.fields.name;
    api.add(deposit_token, fields.info[1]);
  });

  // Hedge Vaults
  const fields3 = await sui.getDynamicFieldObjects({
    parent: HEDGE_VAULT_REGISTRY,
  });
  const hedgeVaults = fields3.filter((item) => item.type.includes("Vault"));

  hedgeVaults.forEach(({ fields }) => {
    const amounts = fields.user_share_supply;
    const main_token = "0x" + fields.main_token.fields.name;
    const hedge_token = "0x" + fields.hedge_token.fields.name;
    const main_amount = amounts[0] + amounts[2]+ amounts[4]+ amounts[6];
    const hedge_amount = amounts[1] + amounts[3]+ amounts[5]+ amounts[7];
    api.add(main_token, main_amount);
    api.add(hedge_token,hedge_amount);
  });
}

module.exports = {
  timetravel: false,
  doublecounted: true,
  sui: {
    tvl,
  },
};
