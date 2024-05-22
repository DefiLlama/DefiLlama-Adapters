const { get } = require("../helper/http");
const sdk = require("@defillama/sdk");

const ETH_ADDRESS = "0x0000000000000000000000000000000000000000";
const API_URL =
  "https://ponzi-backend-production.up.railway.app/api/analytics/games/contracts";

async function tvl() {
  //fetch all game contracts
  const contracts = await get(API_URL);

  const gameContractsBalancesData = await sdk.api.eth.getBalances({
    targets: contracts,
    chain: "arbitrum",
  });

  const balances = {};

  gameContractsBalancesData.output.forEach((contractBalanceData) => {
    sdk.util.sumSingleBalance(
      balances,
      ETH_ADDRESS,
      contractBalanceData.balance
    );
  });

  return balances;
}

module.exports = {
  timetravel: false,
  methodology:
    "Ponzi Market's TVL equals to the sum of all ETH balances of all game contracts",
  arbitrum: {
    tvl,
  },
};
