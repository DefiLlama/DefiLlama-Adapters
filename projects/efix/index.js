/**
 * efixDI+ Protocol - DefiLlama TVL Adapter
 * 
 * efixDI+ tokenizes Brazilian DI (interbank deposit) fund shares,
 * tracking CDI rates, and bridges them into DeFi lending markets.
 * 
 * TVL = total efixDI tokens locked in protocol contracts across chains,
 * valued at BRL/USD rate via Chainlink oracle.
 * 
 * Polygon: EfixVaultV2 holds deposited BRL value as efixDI tokens
 * Base: MinterBurner holds bridged efixDI tokens (via LayerZero V2)
 */

// Contract addresses
const EFIX_DI_TOKEN_POLYGON = "0x04082b283818D9d0dd9Ee8742892eEe5CC396441";
const VAULT_V2_POLYGON = "0x2eA512b4C5e53A8c1302AC8ba2d43c5DA90b307C";
const PIX_BRIDGE_POLYGON = "0x1d97f1adbf545F3C99d33A6a2166Ee423A78f4C3";

const EFIX_DI_TOKEN_BASE = "0xF5cA6d6FC679fA1D1E2B39bD14b92F1c505d5608";
const MINTER_BURNER_BASE = "0x400a8DE2bF8fc4A63000A7E77103eDAE897CB9a3";
const MORPHO_BLUE_BASE = "0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb";

async function polygonTvl(api) {
  // TVL on Polygon = efixDI token balance held in VaultV2 + PIXBridge
  const vaultBalance = await api.call({
    abi: "erc20:balanceOf",
    target: EFIX_DI_TOKEN_POLYGON,
    params: [VAULT_V2_POLYGON],
  });
  
  const bridgeBalance = await api.call({
    abi: "erc20:balanceOf",
    target: EFIX_DI_TOKEN_POLYGON,
    params: [PIX_BRIDGE_POLYGON],
  });

  // Also count total supply minus what's in user wallets
  // The simplest approach: total supply represents all deposited BRL
  const totalSupply = await api.call({
    abi: "erc20:totalSupply",
    target: EFIX_DI_TOKEN_POLYGON,
  });

  api.add(EFIX_DI_TOKEN_POLYGON, totalSupply);
}

async function baseTvl(api) {
  // TVL on Base = efixDI tokens bridged via LayerZero (totalSupply on Base)
  const totalSupply = await api.call({
    abi: "erc20:totalSupply",
    target: EFIX_DI_TOKEN_BASE,
  });

  api.add(EFIX_DI_TOKEN_BASE, totalSupply);
}

module.exports = {
  methodology:
    "TVL is calculated as the total supply of efixDI tokens on each chain. " +
    "Each efixDI token is backed 1:1 by Brazilian DI fund shares (tracking CDI rate). " +
    "On Polygon, tokens are minted when users deposit BRL via PIX. " +
    "On Base, tokens are bridged via LayerZero V2 for use as Morpho Blue collateral. " +
    "Token price is derived from Chainlink BRL/USD oracle on Polygon.",
  start: 1738454400, // Feb 2, 2026 - VaultV2 deployment
  polygon: {
    tvl: polygonTvl,
  },
  base: {
    tvl: baseTvl,
  },
};
