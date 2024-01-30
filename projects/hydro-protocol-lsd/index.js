const { get } = require('../helper/http')
const { endPoints } = require("../helper/chain/cosmos");

const assetInfoUrl = "https://k8s.mainnet.asset.injective.network"
const hInjContract = "inj18luqttqyckgpddndh8hvaq25d5nfwjc78m56lc";

async function tvl(_, _1, _2, { chain }) {
  return loadLsdTotalValueLocked();
}

async function loadFromContract(contract, query) {
  const queryMsg = btoa(JSON.stringify(query));

  return get(endPoints.injective + "/cosmwasm/wasm/v1/contract/" + contract + "/smart/" + queryMsg);
}

/**
 * @returns {Promise<number>}
 */
async function loadInjectivePriceFromChain() {
  return get(`${assetInfoUrl}/asset-price/v1/coins/injective-protocol`)
    .then((responseJson) => responseJson.market_data.current_price.usd);
}

/**
 * @returns {Promise<number>}
 */
async function loadTotalSupply() {
  return loadFromContract(hInjContract, {token_info: {}})
    .then((response) => Number(BigInt(response.data.total_supply) / BigInt(Math.pow(10, response.data.decimals))));
}

/**
 * @returns {Promise<number>}
 */
async function loadLsdTotalValueLocked() {
  const injectivePricePromise = loadInjectivePriceFromChain();
  const totalHInjLockedPromise = loadTotalSupply();

  const [
    injectivePrice,
    totalHInjLocked
  ] = await Promise.all([
    injectivePricePromise,
    totalHInjLockedPromise,
  ]);
  return totalHInjLocked * injectivePrice;
}

module.exports = {
  timetravel: false,
  methodology: "Liquidity on hydro-protocol LSD",
  injective: {
    tvl,
  },
};