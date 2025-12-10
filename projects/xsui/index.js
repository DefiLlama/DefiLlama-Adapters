const ADDRESSES = require('../helper/coreAssets.json')
const sui = require("../helper/chain/sui")

const XSUI_INFO_ID =
  "0x0431232199873db77a92aa645cd43521437e9cc5c6fff07fd03edb88afe0b25a"
const XSUI_COIN_TYPE =
  "0x2b6602099970374cf58a2a1b9d96f005fccceb81e92eb059873baf420eb6c717::x_sui::X_SUI"
const SUI_COIN_TYPE =
  "0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI"

async function loadInfo() {
  const obj = await sui.getObject(XSUI_INFO_ID)
  const totalSupply = BigInt(
    obj.fields.lst_treasury_cap.fields.total_supply.fields.value,
  ) 
  const stakedSui = BigInt(
    obj.fields.storage.fields.total_sui_supply,
  ) ; 
  return { totalSupply, stakedSui }
}

async function tvl(api) {
  const { stakedSui } = await loadInfo()

  api.add(SUI_COIN_TYPE, stakedSui)
}

module.exports = {
  timetravel: false,
  methodology:
    "Calculates the amount of SUI staked in xSUI liquid staking contracts.",
  sui: { tvl },
}
