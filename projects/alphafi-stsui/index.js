const sui = require('../helper/chain/sui')

async function tvl() {
  const pool = await sui.getObject('0x1adb343ab351458e151bc392fbf1558b3332467f23bda45ae67cd355a57fd5f5');
  const suiAmount = pool.fields.storage.fields.total_sui_supply / 10 ** 9
  return {
    sui: suiAmount,
  }
}

module.exports = {
  methodology: "Calculates the amount of SUI staked in stSui liquid staking contracts.",
  sui: {
    tvl,
  }
}
