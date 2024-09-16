const sui = require("../helper/chain/sui");

const SAFU_REGISTRY = "0xdc970d638d1489385e49ddb76889748011bac4616b95a51aa63633972b841706";

async function tvl(api) {
  const fields = await sui.getDynamicFieldObjects({
    parent: SAFU_REGISTRY,
  });
  // console.log(fields);
  const safuVaults = fields.filter((item) => item.type.includes("Vault"));

  safuVaults.forEach(({ fields }) => {
    // console.log(fields);
    const deposit_token = "0x" + fields.deposit_token.fields.name;

    const share_supply = fields.share_supply;
    // deposit_token
    const total_share =
      Number(share_supply[0]) +
      Number(share_supply[1]) +
      Number(share_supply[2]) +
      Number(share_supply[3]);

    api.add(deposit_token, total_share);
  });
}

module.exports = {
  timetravel: false,
  sui: {
    tvl,
  },
};
