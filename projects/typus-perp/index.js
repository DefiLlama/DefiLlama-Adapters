const sui = require("../helper/chain/sui");

const LIQUIDITY_POOL_0 = "0x98110aae0ffaf294259066380a2d35aba74e42860f1e87ee9c201f471eb3ba03";

async function tvl(api) {
  // Safu Vaults
  const fields = await sui.getDynamicFieldObjects({
    parent: LIQUIDITY_POOL_0,
  });
  const balances = fields.filter((item) => item.type.includes("Balance"));

  balances.forEach(({ fields }) => {
    // console.log(fields);
    const token = "0x" + fields.name.fields.name;
    api.add(token, fields.value);
  });

}

module.exports = {
  timetravel: false,
  doublecounted: true,
  sui: {
    tvl,
  },
};
