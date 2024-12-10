const sui = require("../helper/chain/sui");  
 
async function tvl(api) {

    // Add TVL from SUI liquid staking
    const dsui_vault = await sui.getObject("0x85aaf87a770b4a09822e7ca3de7f9424a4f58688cfa120f55b294a98d599d402");
    let sui_staked = Number(Number(dsui_vault.fields.dsui_supply * dsui_vault.fields.sui_claimable_per_dsui / 1e9 + dsui_vault.fields.sui_to_stake).toFixed(0));
    api.add( "0x2::sui::SUI", sui_staked) 

}
    
module.exports = {
  timetravel: false,
  sui: {
    tvl,
  },
  methodology: "TVL consists of SUI staked with DegenHive's liquid staking protocol."
};