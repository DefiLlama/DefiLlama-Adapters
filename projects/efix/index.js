/**
 * efixDI+ Protocol - DefiLlama TVL Adapter
 *
 * efixDI+ tokenizes Brazilian DI (interbank deposit) fund shares,
 * tracking CDI rates (~14.9% APY), and bridges them into DeFi
 * lending markets via LayerZero V2.
 *
 * TVL = total efixDI token supply on each chain, valued at BRL/USD
 * rate via Chainlink oracle (0xB90DA3ff54C3ED09115abf6FbA0Ff4645586af2c).
 *
 * Regulated under CVM Resolution 88/2022.
 * Website: https://efix.finance
 *
 * @module projects/efix
 */

/** @constant {string} efixDI token contract on Polygon */
const EFIX_DI_TOKEN_POLYGON = "0x04082b283818D9d0dd9Ee8742892eEe5CC396441";
/** @constant {string} VaultV2 contract on Polygon (deposits/withdrawals) */
const VAULT_V2_POLYGON = "0x2eA512b4C5e53A8c1302AC8ba2d43c5DA90b307C";
/** @constant {string} PIX Bridge contract on Polygon (BRL on/off ramp) */
const PIX_BRIDGE_POLYGON = "0x1d97f1adbf545F3C99d33A6a2166Ee423A78f4C3";
/** @constant {string} efixDI token contract on Base (minted via LayerZero) */
const EFIX_DI_TOKEN_BASE = "0xF5cA6d6FC679fA1D1E2B39bD14b92F1c505d5608";
/** @constant {string} MinterBurner contract on Base (LayerZero V2 endpoint) */
const MINTER_BURNER_BASE = "0x400a8DE2bF8fc4A63000A7E77103eDAE897CB9a3";
/** @constant {string} Morpho Blue core contract on Base */
const MORPHO_BLUE_BASE = "0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb";

/**
 * Calculates TVL on Polygon by fetching the total supply of efixDI tokens.
 * Each token is backed 1:1 by Brazilian DI fund shares deposited via PIX.
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
 * Tokens on Base are minted via LayerZero V2 OFT bridge from Polygon and used
 * as collateral in Morpho Blue lending markets.
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
  methodology:
    "TVL is calculated as the total supply of efixDI tokens on each chain. " +
    "Each efixDI token is backed 1:1 by Brazilian DI fund shares (tracking CDI rate). " +
    "On Polygon, tokens are minted when users deposit BRL via PIX. " +
    "On Base, tokens are bridged via LayerZero V2 for use as Morpho Blue collateral. " +
    "Token price is derived from Chainlink BRL/USD oracle on Polygon.",
  start: 1738454400,
  polygon: {
    tvl: polygonTvl,
  },
  base: {
    tvl: baseTvl,
  },
};
