const { get } = require('../helper/http')
const { endPoints } = require("../helper/chain/cosmos");

const assetInfoUrl = "https://k8s.mainnet.asset.injective.network"
const hInjContract = "inj18luqttqyckgpddndh8hvaq25d5nfwjc78m56lc";


async function tvl(_, _1, _2, { chain }) {
  return loadTotalValueLocked();
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

/**
 * @returns {Promise<number>}
 */
async function loadTotalValueLocked() {
  const injectivePricePromise = loadInjectivePriceFromChain();
  // const hInjInjPairAssetsPromise = loadAssets(hInjInjPairContract);
  const lsdTotalValueLockedPromise = loadLsdTotalValueLocked();

  // hinj-inj pool - completed
  // hinj-hydro pool - todo
  // hydro-inj pool - todo
  // hydro-xhydro pool - todo

  const [
    injectivePrice,
    // hInjInjPairAssets,
    lsdTotalValueLocked,
  ] = await Promise.all([
    injectivePricePromise,
    // hInjInjPairAssetsPromise,
    lsdTotalValueLockedPromise,
  ]);

  // const injSum = BigInt(hInjInjPairAssets[0].amount) + BigInt(hInjInjPairAssets[1].amount);
  const injSum = BigInt(0);
  const scaledInjSum = Number(injSum / BigInt(1e18));
  const hydroSum = BigInt(0);     // TODO
  const scaledHydroSum = Number(hydroSum / BigInt(1e18));
  const hydroPrice = 0;       // TODO
  return scaledInjSum * injectivePrice + scaledHydroSum * hydroPrice + lsdTotalValueLocked;
}

module.exports = {
  timetravel: false,
  methodology: "Liquidity on hydro-protocol",
  injective: {
    tvl,
  },
};