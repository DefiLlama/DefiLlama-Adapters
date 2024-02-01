const { toUSDTBalances } = require("../helper/balances");
const { fetchURL } = require("../helper/utils");

async function getStakingData() {
  const data = await fetchURL("https://api.vyfi.io/analytics");
  
  let tvl = 0;

  // Include the total value locked in nftVaults and nftVaultsV2 and lpVaults
  tvl += data.data.nftVaults.totalValueLocked;
  tvl += data.data.nftVaultsV2.totalValueLocked;
  tvl += data.data.lpVaultsV2.totalValueLocked;

  for (const vault of data.data.tokenVaults.vaults.concat(data.data.tokenVaultsV2.vaults)) {
    if (vault.project !== 'vyfi') {
      tvl += vault.totalVaultValue;
    }
  }

  return toUSDTBalances(tvl);
}


async function getVYFIVaultsData() {
  const data = await fetchURL("https://api.vyfi.io/analytics");
  
  let tvl = 0;
  for (const vault of data.data.tokenVaults.vaults.concat(data.data.tokenVaultsV2.vaults)) {
    if (vault.project === 'vyfi') {
      tvl += vault.totalVaultValue;
    }
  }
  
  return toUSDTBalances(tvl);
}




module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  cardano: {
    tvl: getStakingData,
    staking: getVYFIVaultsData
  },
};
