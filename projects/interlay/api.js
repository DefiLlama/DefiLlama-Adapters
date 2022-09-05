
const { getAPI } = require('../helper/acala/api')

async function tvl(){
  const api = await getAPI('interlay');

  const interlayTVL = {}
  
  // Fetch total BTC locked (= kBTC minted)
  const tokens = await api.query.tokens.totalIssuance.entries()
  const iBTCTokenStorageKey = "0x99971b5749ac43e0235e41b0d378691857c875e4cff74148e4628f264b974c80d67c5ba80ba065480001"
  for (const t of tokens){
    if(t[0] == iBTCTokenStorageKey){
      interlayTVL.bitcoin = parseInt(t[1])/1e8
    break
    }
  }

  // Fetch collateral locked to secure kBTC
  const collaterals = await api.query.vaultRegistry.totalUserVaultCollateral.entries()

  const collateralStorageKeys = {
    polkadot : "0x8402aaa79721798ff725d48776181a44a42c51e2c6fef3b5d83341e8096ff7bfd6bfa4fbbbb302d0f4e13a890467318100000001",
  }

  for (const col of collaterals){
    // check against DOT collateral storage key
    if(col[0] == collateralStorageKeys.polkadot){
      interlayTVL.polkadot = parseInt(col[1]/1e10)
      continue;
    }
  }
  return interlayTVL
}


module.exports = {
  timetravel: false,
  methodology: "Tracks BTC wrapped and assets locked as collateral by Vaults in Interlay's interBTC bridge protocol.",
  interlay: { tvl }
};


