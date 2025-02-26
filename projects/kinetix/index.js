const { gmxExports } = require('../helper/gmx')
const { staking } = require('../helper/staking');

const KAI_ADDRESS_KAVA = "0x52369B1539EA8F4e1eadEEF18D85462Dcf9a3658"
const veKAI_ADDRESS_KAVA = "0x2A0A26D08E2F7A8E86431Ddf6910Fe7cD59b9908"

module.exports = {
  kava: {
    tvl: gmxExports({ vault: "0xa721f9f61CECf902B2BCBDDbd83E71c191dEcd8b", }),
    staking: staking(veKAI_ADDRESS_KAVA, KAI_ADDRESS_KAVA),
  },
};