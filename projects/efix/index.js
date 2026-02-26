/**
 * efixDI+ Protocol - DefiLlama TVL Adapter
 *
 * efixDI+ tokenizes Brazilian DI (interbank deposit) fund shares,
 * tracking CDI rates (~14.9% APY), and bridges them into DeFi
 * lending markets via LayerZero V2 OFT (burn-on-source / mint-on-destination).
 *
 * TVL = total efixDI token supply on each chain.
 * No double-counting: LayerZero V2 OFT burns tokens on Polygon when
 * minting on Base, so totalSupply on each chain is mutually exclusive.
 *
 * Tokens are not yet listed on CoinGecko/CMC, so misrepresentedTokens
 * is set to true — each efixDI is backed 1:1 by BRL-denominated DI
 * fund shares, valued via Chainlink BRL/USD oracle on Polygon.
 *
 * Regulated under CVM Resolution 88/2022.
 * Website: https://efix.finance
 *
 * @module projects/efix
 */

const ADDRESSES = require("../helper/coreAssets.json");

/** @constant {string} efixDI token contract on Polygon */
const EFIX_DI_TOKEN_POLYGON = "0x04082b283818D9d0dd9Ee8742892eEe5CC396441";

/** @constant {string} efixDI token contract on Base (minted via LayerZero V2 OFT) */
const EFIX_DI_TOKEN_BASE = "0xF5cA6d6FC679fA1D1E2B39bD14b92F1c505d5608";

/**
 * Calculates TVL on Polygon by fetching the total supply of efixDI tokens.
 * Each token is backed 1:1 by Brazilian DI fund shares deposited via PIX.
 * totalSupply represents all BRL deposited and tokenized on this chain.
 *
 * @param {object} api - DefiLlama SDK API object for chain interactions
 * @returns {Promise<void>} Adds token balances to the api accumulator
 */
async function polygonTvl(api) {
  const totalSupply = await api.call({
    abi: "erc20:totalSupply",
    target: EFIX_DI_TOKEN_POLYGON,
  });
  api.add(EFIX_DI_TOKEN_POLYGON, totalSupply);
}

/**
 * Calculates TVL on Base by fetching the total supply of bridged efixDI tokens.
 * Tokens on Base are minted via LayerZero V2 OFT bridge from Polygon
 * (burn-on-source / mint-on-destination) and used as collateral in
 * Morpho Blue lending markets. No double-counting with Polygon supply.
 *
 * @param {object} api - DefiLlama SDK API object for chain interactions
 * @returns {Promise<void>} Adds token balances to the api accumulator
 */
async function baseTvl(api) {
  const totalSupply = await api.call({
    abi: "erc20:totalSupply",
    target: EFIX_DI_TOKEN_BASE,
  });
  api.add(EFIX_DI_TOKEN_BASE, totalSupply);
}

/** @type {object} DefiLlama adapter export */
module.exports = {
  misrepresentedTokens: true,
  methodology:
    "TVL is calculated as the total supply of efixDI tokens on each chain. " +
    "Each efixDI token is backed 1:1 by Brazilian DI fund shares (tracking CDI rate ~14.9% APY). " +
    "On Polygon, tokens are minted when users deposit BRL via PIX. " +
    "On Base, tokens arrive via LayerZero V2 OFT bridge (burn-on-source / mint-on-destination), " +
    "ensuring no double-counting across chains. " +
    "Used as collateral in Morpho Blue lending markets on Base.",
  start: 1769990400,
  polygon: {
    tvl: polygonTvl,
  },
  base: {
    tvl: baseTvl,
  },
};
