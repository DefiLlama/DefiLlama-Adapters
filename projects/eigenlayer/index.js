const sdk = require("@defillama/sdk");
const axios = require("axios");
const POD_SUMMARY_ENDPOINT = "https://preprod-goerli.eigenlayer.xyz";
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

async function fetchPodSummary() {
  const url = `${POD_SUMMARY_ENDPOINT}/restaking/v1/pod/${ZERO_ADDRESS}/summary`;
  const response = await axios.get(url);
  return response.data || {};
}

const CONFIG = {
  "rocket-pool-eth": {
    token_contract: "0x178E141a0E3b34152f73Ff610437A7bf9B83267A",
    strategy_contract: "0x879944A8cB437a5f8061361f82A6d4EED59070b5",
  },
  "staked-ether": {
    token_contract: "0x1643E812aE58766192Cf7D2Cf9567dF2C37e9B7F",
    strategy_contract: "0xB613E78E2068d7489bb66419fB1cfa11275d14da",
  },
};

async function tvl(_, _b, _cb, { api }) {
  const balances = {};
  const podSummaryResult = await fetchPodSummary();
  for (const [coinGeckoID, value] of Object.entries(CONFIG)) {
    const balance = await api.call({
      abi: "erc20:balanceOf",
      target: value.token_contract,
      params: [value.strategy_contract],
    });

    sdk.util.sumSingleBalance(balances, coinGeckoID, balance / 1e18);
  }

  balances["ethereum"] = podSummaryResult.globalStats.balance / 1e18;

  return balances;
}

module.exports = {
  goerli: {
    tvl,
  },
};
