const { PublicKey } = require("@solana/web3.js");
const { VAULTS, START_TIMESTAMP } = require("./constants");
const { initialize, formatDate } = require("./helpers");


/**
 * Fetch historical TVL data from the vault's data repository.
 * @param {object} vault - Vault object containing data URL and token details.
 * @param {string} date - Date string in YYYY-MM-DD format.
 * @returns {Promise<{usd_tvl: number, token_tvl: number}>} - Historical TVL data.
 */
async function fetchHistoricalTvl(vault, date) {
  let usd_tvl = 0;
  let token_tvl = 0;

  try {
    const response = await fetch(vault.dataUrl);
    const allEntries = Object.entries(await response.json());
    const entry = allEntries.find(([entryTime]) => entryTime?.startsWith(date));
    if (entry) {
      const [, entryData] = entry;
      usd_tvl = entryData?.TVL_USD || 0;
      token_tvl = (entryData?.TVL_TOKEN || 0) * Math.pow(10, vault.token.decimals);
    }
  } catch (error) {
    console.error(`Error fetching historical TVL for vault ${vault.name} on ${date}:`, error);
  }

  return { usd_tvl, token_tvl };
}


/**
 * Fetch the current TVL of a vault from the blockchain.
 * @param {object} vault - Vault object containing address and token details.
 * @param {object} client - Drift client for interacting with the blockchain.
 * @returns {Promise<number>} - Current token TVL.
 */
async function fetchCurrentTvl(vault, client) {
  try {
    const vaultInstance = await client.getVault(new PublicKey(vault.address));
    const token_tvl = await client.calculateVaultEquityInDepositAsset({
      address: vault.address,
      vault: vaultInstance,
      factorUnrealizedPNL: true,
    });
    return Number(token_tvl);
  } catch (error) {
    console.error(`Error fetching current TVL for vault ${vault.name}:`, error);
    return 0;
  }
}


/**
 * Main TVL calculation function, handling both historical and current data.
 * @param {object} api - API object to aggregate TVL data.
 */
async function tvl(api) {
  const queryDate = new Date(api.timestamp * 1000);
  queryDate.setHours(0, 0, 0, 0);
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  const isHistorical = queryDate.valueOf() < currentDate.valueOf();

  // Fetch historical TVL from Neutral.trade data repository.
  if (isHistorical) {
    console.log("fetching tvl from historical data repository");
    for (const vault of VAULTS) {
      const { token_tvl } = await fetchHistoricalTvl(vault, formatDate(queryDate));
      api.add(vault.token.mint, token_tvl);
    }
  }

  // Fetch current TVL from the blockchain.
  else {
    console.log("fetching tvl from current onchain data");
    const { client, client_jlpdnv1 } = await initialize();
    await Promise.all(
      VAULTS.map(async (vault) => {
        const _client =
          vault.name === "USDC Staking (JLP Delta Neutral)" ? client_jlpdnv1 : client;
        const token_tvl = await fetchCurrentTvl(vault, _client);
        api.add(vault.token.mint, token_tvl);
      })
    );
  }
}


module.exports = {
  start: START_TIMESTAMP,
  timetravel: true,
  methodology: "The combined TVL and PnL of all public and private vaults.",
  solana: { tvl },
};
