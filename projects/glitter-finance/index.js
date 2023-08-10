const { treasuryExports, } = require("../helper/treasury")

const ETHEREUM_VAULT = "0xa234acbd98a917f6dda69298e0e7290380006cf1";
const ARBITRUM_VAULT = "0x446c264ed8888dad27f5452094d2ceadb1e038ea";
const ZKEVM_VAULT = "0x175355fa6fa82f1bb6868cd885da13069c4e861c";
const POLYGON_VAULT = "0x72decebe0597740551396d3c9e7546cfc97971e9";
const AVALANCHE_VAULT = "0xa234acbd98a917f6dda69298e0e7290380006cf1";
const BINANCE_VAULT = "0x446c264ed8888dad27f5452094d2ceadb1e038ea";
const OPTIMISM_VAULT = "0x446c264ed8888dad27f5452094d2ceadb1e038ea";

module.exports = {
  hallmarks: [
    [1661337600, "SPL Vault Migration (V2 Expansion)"],
  ],
  timetravel: false,
  methodology:
    "TVL counts tokens and native assets locked in Glitter-Finance bridge vaults. CoinGecko is used to find the price of tokens in USD.",
  ...treasuryExports({
    solana: {
      owners: ['7xCU4nvqu3Nz3BBQckKzibp3kBav4xbkuqQ3WM9CBHdJ'],
    },
    algorand: {
      owner: 'R7VCOR74LCUIFH5WKCCMZOS7ADLSDBQJ42YURFPDT3VGYTVNBNG7AIYTCQ',
    },
    ethereum: {
      tokensAndOwners: [['0x68f0c0003f1826c4e9646df7e1ecf3707fee0581', ETHEREUM_VAULT]],
    },
  }),
};
