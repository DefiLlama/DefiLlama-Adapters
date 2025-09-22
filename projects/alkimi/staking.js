const sui = require("../helper/chain/sui");

const STAKING_VAULT = "0xc92fe84368fc3ff40713792c750709501fcfc4869f120755fd0bea5cac1ead94";
const ALKIMI_DECIMALS = 9n;
const ALKIMI_COINGECKO_ID = "alkimi-2";

module.exports = async function staking() {
  const balances = {};

  const obj = await sui.getObject(STAKING_VAULT);
  const fields = obj?.fields;

  if (fields && fields.balance) {
    const total = BigInt(fields.balance);
    balances[ALKIMI_COINGECKO_ID] = Number(total / 10n ** ALKIMI_DECIMALS);
  }

  return balances;
};