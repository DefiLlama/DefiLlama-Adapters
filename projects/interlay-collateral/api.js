
const { getAPI } = require('../helper/acala/api')

async function tvl(){
  const api = await getAPI('interlay');

  const interlayTVL = {}

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
  methodology: "Tracks assets locked as collateral by Vaults in Interlay's interBTC bridge protocol.",
  interlay: { tvl }
};


