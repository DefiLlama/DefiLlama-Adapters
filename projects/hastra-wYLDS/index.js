const { getTokenSupplies, getTokenAccountBalances } = require('../helper/solana')
const { sumTokens2 } = require('../helper/unwrapLPs');

const wYLDSAccount = "8fr7WGTVFszfyNWRMXj6fRjZZAnDwmXwEpCrtzmUkdih"
const RedeemVaultAccount = "HH1hSzaBKvBDf7GWD1mw557Q8LwBPHHE63WEu6BURS8X"

async function solanaTvl(api) {
    const redeemVaultBalance = await getTokenAccountBalances([RedeemVaultAccount])
    Object.keys(redeemVaultBalance).map(token => api.add(token, redeemVaultBalance[token]))
    await getTokenSupplies([wYLDSAccount], { api })
    return api.getBalances()
}

async function provenanceTvl(api) {
  const tokenSupplies = await getTokenSupplies([wYLDSAccount])
  // Provenance holds a 1:1 balance of YLDS to wYLDS
  api.add('ylds', Object.values(tokenSupplies)[0] / 1e6)
  return sumTokens2({ api })
}

module.exports = {
  doublecounted: true,
  timetravel: true,
  methodology: 'Solana TVL consists of the amount of minted wYLDS and any value in the Redeem Vault. Provenance TVL is a 1:1 with minted wYLDS.',
  solana: { tvl: solanaTvl },
  provenance: { tvl: provenanceTvl },
};
