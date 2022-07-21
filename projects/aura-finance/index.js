const sdk = require("@defillama/sdk");
const utils = require("../helper/utils");

const addresses = {
  aura: "0xc0c293ce456ff0ed870add98a0828dd4d2903dbf",
  auraLocker: "0x3Fa73f1E5d8A792C80F426fc8F84FBF7Ce9bBCAC",
  bal: "0xba100000625a3754423978a60c9317c58a424e3d",
  veBal: "0xC128a9954e6c874eA3d62ce62B468bA073093F25",
  auraDelegate: "0xaF52695E1bB01A16D33D7194C28C42b10e0Dbec2",
};

/**
 * Fetches the TVL of Aura Finance
 * @returns {Promise<{balancer: {tvl: number, breakdown: {[address: string]: number}}}>}
 */
const fetchTvl = async () => {
  const resp = await utils.fetchURL("https://aura-metrics.onrender.com/tvl");
  return resp.data;
};

const BalanceOfAbi = {
  stateMutability: "view",
  type: "function",
  name: "balanceOf",
  inputs: [{ name: "addr", type: "address" }],
  outputs: [{ name: "", type: "uint256" }],
};
const TotalSupplyAbi = {
  stateMutability: "view",
  type: "function",
  name: "totalSupply",
  inputs: [],
  outputs: [{ name: "", type: "uint256" }],
};

/**
 * Fetches the PCV of Aura Finance
 * @returns {Promise<{pcv: number, percent: number}>}
 */
const fetchPcv = async () => {
  const { output: balance } = await sdk.api.abi.call({
    abi: BalanceOfAbi,
    target: addresses.veBal,
    params: addresses.auraDelegate,
  });
  const { output: totalSupply } = await sdk.api.abi.call({
    abi: TotalSupplyAbi,
    target: addresses.veBal,
  });

  const priceUrl = `https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=${addresses.bal}&vs_currencies=USD`;
  const { data: priceResp } = await utils.fetchURL(priceUrl);
  const price = priceResp[addresses.bal].usd;

  return {
    pcv: (balance * price * 2.5) / 1e18,
    percent: balance / totalSupply,
  };
};

const fetch = async () => {
  const { balancer } = await fetchTvl();
  const { tvl } = balancer;
  const { pcv } = await fetchPcv();

  return tvl + pcv;
};

module.exports = {
  methodology:
    "TVL of Aura Finance consists of both the total deposited assets (fetched from the Aura Finance's Metrics API) and protocol-controlled value via veBAL (fetched on-chain)",
  fetch,
};
