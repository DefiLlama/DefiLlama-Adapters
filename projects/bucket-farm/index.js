const ADDRESSES = require('../helper/coreAssets.json')
const sui = require("../helper/chain/sui");

const POINT_CENTER_ID = '0xc60fb4131a47aa52ac27fe5b6f9613ffe27832c5f52d27755511039d53908217'

async function tvl(api) {
  const pointCenter = await sui.getObject(POINT_CENTER_ID)
  const poolStates = pointCenter.fields.pool_states.fields.contents.map((state)=>{
    const value = state.fields.value.fields
    return{
      assetType: "0x" + value.asset_type,
      totalStake: value.total_stake
    }
  })

  for(const poolState of poolStates){
    let assetType = poolState.assetType
    if(assetType == "0x922d15d7f55c13fd790f6e54397470ec592caa2b508df292a2e8553f3d3b274f::msui::MSUI" || assetType == "0x41ff228bfd566f0c707173ee6413962a77e3929588d010250e4e76f0d1cc0ad4::ksui::KSUI" || assetType == "0xd1b72982e40348d069bb1ff701e634c117bb5f741f44dff91e472d3b01461e55::stsui::STSUI" || assetType == "0xfbdd50dd7bc7af482d308f8c5d8c66c23e3b59494ff92f2947b150f20b5f43fd::af_lp::AF_LP") {
      assetType = ADDRESSES.sui.SUI
    }
  api.add(assetType, poolState.totalStake)
  }
}

module.exports = {
  deadFrom: 1757419496,
  sui: {
    tvl
  }
}