
const { getAPI } = require('../helper/acala/api')

async function tvl(){
  const api = await getAPI('kintsugi');
  const kintsugiTVL = {}
  
  // Fetch total BTC locked (= kBTC minted)
  const tokens = await api.query.tokens.totalIssuance.entries()
  const kBTCTokenStorageKey = "0x99971b5749ac43e0235e41b0d378691857c875e4cff74148e4628f264b974c801fce6bee3ae455b7000b"
  for (const t of tokens){
    if(t[0] == kBTCTokenStorageKey){
      kintsugiTVL["kintsugi-btc"] = parseInt(t[1])/1e8
    break
    }
  }

  // Fetch collateral locked to secure kBTC
  const collaterals = await api.query.vaultRegistry.totalUserVaultCollateral.entries()

  const collateralStorageKeys = {
    kusama : "0x8402aaa79721798ff725d48776181a44a42c51e2c6fef3b5d83341e8096ff7bf86912b1520d5063e99eae244999431f6000a000b",
    kintsugi : "0x8402aaa79721798ff725d48776181a44a42c51e2c6fef3b5d83341e8096ff7bf40a58d492a448a966b0e1f6b9d219c44000c000b"
  }

  for (const col of collaterals){
    // check against KSM collateral storage key
    if(col[0] == collateralStorageKeys.kusama){
      kintsugiTVL.kusama = parseInt(col[1]/1e12)
      continue;
    }
    // check against KINT collateral storage key
    if(col[0] == collateralStorageKeys.kintsugi){
      kintsugiTVL.kintsugi = parseInt(col[1]/1e10)
      continue;
    }
  }

  return kintsugiTVL
}


module.exports = {
  timetravel: false,
  methodology: "Tracks BTC wrapped and assets locked as collateral by Vaults in kBTC bridge protocol.",
  kintsugi: { tvl }
};


