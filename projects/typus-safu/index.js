const sui = require("../helper/chain/sui");

const SAFU_REGISTRY = "0xdc970d638d1489385e49ddb76889748011bac4616b95a51aa63633972b841706";
const FUNDING_VAULT_REGISTRY = "0xeb9e1c94b72cd3e1a4ca2e4d6e9dd61547c0c45c654843e0db03c50ba3c21138";

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
}

module.exports = {
  timetravel: false,
  doublecounted: true,
  sui: {
    tvl,
  },
};
