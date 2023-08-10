const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport, } = require("../helper/sumTokens")

//addresses
const SOLANA_VAULT = "7xCU4nvqu3Nz3BBQckKzibp3kBav4xbkuqQ3WM9CBHdJ";
const ALGO_VAULT = "R7VCOR74LCUIFH5WKCCMZOS7ADLSDBQJ42YURFPDT3VGYTVNBNG7AIYTCQ";
const ETHEREUM_VAULT = "0xa234acbd98a917f6dda69298e0e7290380006cf1";
const ARBITRUM_VAULT = "0x446c264ed8888dad27f5452094d2ceadb1e038ea";
const ZKEVM_VAULT = "0x175355fa6fa82f1bb6868cd885da13069c4e861c";
const POLYGON_VAULT = "0x72decebe0597740551396d3c9e7546cfc97971e9";
const AVALANCHE_VAULT = "0xa234acbd98a917f6dda69298e0e7290380006cf1";
const BINANCE_VAULT = "0x446c264ed8888dad27f5452094d2ceadb1e038ea";
const OPTIMISM_VAULT = "0x446c264ed8888dad27f5452094d2ceadb1e038ea";


//SOLANA CODE -> SOLANA HELPERS WERE RETURNING 504 ERRORS
const axios = require('axios');
const rpcUrl = 'https://api.mainnet-beta.solana.com'; // Use appropriate network URL

async function getSolBalance(_, _1, _2, { api }) {
  try {
    const response = await axios.post(
      rpcUrl,
      {
        jsonrpc: '2.0',
        id: 1,
        method: 'getBalance',
        params: [SOLANA_VAULT],
      }
    );
    
    const solBalance = response.data.result.value ; // Convert lamports to SOL
    api.add(ADDRESSES.solana.SOL, solBalance);
  } catch (error) {
    console.error('Error:', error.message);
  }
  return  api.add(ADDRESSES.solana.SOL, 0);
}
//END SOLANA CODE

module.exports = {
    hallmarks: [
        [1661337600, "SPL Vault Migration (V2 Expansion)"],
    ],
    timetravel: false,
    methodology:
        "TVL counts tokens and native assets locked in Glitter-Finance bridge vaults. CoinGecko is used to find the price of tokens in USD.",
    solana: { tvl: getSolBalance },
    algorand: { tvl: sumTokensExport({ owners: [ALGO_VAULT] }) },
    ethereum: { tvl: sumTokensExport({ owners: [ETHEREUM_VAULT] }) },
    arbitrum: { tvl: sumTokensExport({ owners: [ARBITRUM_VAULT] }) },
    polygon_zkevm: { tvl: sumTokensExport({ owners: [ZKEVM_VAULT] }) },
    polygon: { tvl: sumTokensExport({ owners: [POLYGON_VAULT] }) },
    avax: { tvl: sumTokensExport({ owners: [AVALANCHE_VAULT] }) },
    binance: { tvl: sumTokensExport({ owners: [BINANCE_VAULT] }) },
    optimism: { tvl: sumTokensExport({ owners: [OPTIMISM_VAULT] }) },
    

};