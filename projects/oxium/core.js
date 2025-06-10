/**
 * @typedef {`0x${string}`} Address
 * @typedef {`${number}`} NumString
 * @typedef {readonly [Address, Address, NumString]} Market
 * 
 * @typedef {Object} Offer
 * @property {Address} maker
 * @property {NumString} gives
 */

const { BigNumber } = require("bignumber.js");
const oxiumConfig = require("./config");
const { readerAbi, vaultFactoryAbi, vaultAbi} = require("./abi")

/**
 * 
 * @param {import("@defillama/sdk").ChainApi} api 
 * @param {oxiumConfig.ChainConfig} configEntry 
 * @returns {Promise<Market[]>}
 */
async function getOpenMarkets(api, configEntry) {
  return api.call({
    target: configEntry.reader,
    abi: readerAbi.openMarkets,
  })
}

/**
 * 
 * @param {import("@defillama/sdk").ChainApi} api 
 * @param {oxiumConfig.ChainConfig} configEntry 
 * @param {Market} market 
 * @param {number} fromId 
 * @param {number} depth 
 * @returns {Promise<{offers: Offer[], nextId: NumString}>}
 */
async function getOffers(api, configEntry, market, fromId, depth = 100) {
  const [newCurrId, _, offers, offerDetails] = await api.call({
    target: configEntry.reader,
    abi: readerAbi.offerList,
    params: [market, fromId, depth],
  });

  return { 
    offers: offers.map((offer, index) => ({
      maker: offerDetails[index][0],
      gives: offer[3],
    })), 
    nextId: newCurrId
 };
}

/**
 * 
 * @param {import("@defillama/sdk").ChainApi} api 
 * @param {oxiumConfig.ChainConfig} configEntry 
 * @param {Market} market 
 * @param {Map<Address, BigNumber>} result 
 * @returns {Promise<Map<Address, BigNumber>>}
 */
async function offersPerMakerOn(api, configEntry, market, result = new Map()) {
  /** @type {number} */
  let currentId = 0;

  do {
    const {offers, nextId} = await getOffers(api, configEntry, market, currentId);
    for (const offer of offers) {
      if (!result.has(offer.maker)) {
        result.set(offer.maker, BigNumber(0));
      }
      result.set(offer.maker, result.get(offer.maker).plus(offer.gives));
    }
    currentId = Number(nextId);
  } while (currentId !== 0);

  return result;
}

/**
 * 
 * @param {import("@defillama/sdk").ChainApi} api 
 * @param {oxiumConfig.ChainConfig} configEntry 
 * @param {Market[]} markets 
 * @returns {Promise<Map<Address, Map<Market, BigNumber>>>>}
 */
async function getMakersPerMarket(api, configEntry, markets) {
  /** @type {Map<Address, Map<Market, BigNumber>>} */
  const result = await Promise.all(
    markets
      .map(async (market) => ({
        result: await offersPerMakerOn(api, configEntry, market),
        token: market[0]
      }))
  ).then((/** @type {Array<{result: Map<Address, BigNumber>, token: Address}>} */ results) => {
    return results.reduce((acc, {result, token}) => {
      if (!acc.has(token)) {
        acc.set(token, new Map());
      }
      /** @type {Map<Address, BigNumber>} */
      const tokenMap = acc.get(token);
      for (const [market, amount] of result.entries()) {
        if (!tokenMap.has(market)) {
          tokenMap.set(market, BigNumber(0));
        }
        tokenMap.set(market, tokenMap.get(market).plus(amount));
      }
      return acc;
    }, /** @type {Map<Address, Map<Address, BigNumber>>} */ (new Map()));
  })
  return result;
}

module.exports = {
  getOpenMarkets,
  getMakersPerMarket,
}