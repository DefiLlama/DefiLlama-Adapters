const sui = require("../helper/chain/sui");

const SAFU_REGISTRY = "0xdc970d638d1489385e49ddb76889748011bac4616b95a51aa63633972b841706";

async function tvl(api) {
  const fields = await sui.getDynamicFieldObjects({
    parent: SAFU_REGISTRY,
  });
  const safuVaults = fields.filter((item) => item.type.includes("Vault"));

  safuVaults.forEach(({ fields }) => {
    const deposit_token = "0x" + fields.deposit_token.fields.name;
    api.add(deposit_token, fields.share_supply.slice(0, 4));
  });
}

module.exports = {
  timetravel: false,
  doublecounted: true,
  sui: {
    tvl,
  },
};
