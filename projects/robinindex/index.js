// DefiLlama TVL adapter for RobinIndex ($RBDX) on Robinhood Chain.
// Place at: projects/robinindex/index.js in github.com/DefiLlama/DefiLlama-Adapters
// TVL = every Stock Token balance held by the RBDXVault (the index's backing basket).
// The vault exposes heldTokensList() (tokens with a nonzero balance), so no hardcoded
// asset list is needed and new listings are picked up automatically.

const { sumTokens2 } = require("../helper/unwrapLPs");

const VAULT = "0xc3ce9C84E9E012A32dFf7B7B0E2d44A30A96477e";
const REGISTRY = "0x6b61Aa9576Eb6Cbb19ac6aB350519Ac37f9CCE79";

async function tvl(api) {
  // Prefer the registry's full asset list (covers tokens the vault may hold at 0 today).
  let tokens;
  try {
    tokens = await api.call({ target: REGISTRY, abi: "function getAssetList() view returns (address[])" });
  } catch (e) {
    tokens = await api.call({ target: VAULT, abi: "function heldTokensList() view returns (address[])" });
  }
  return sumTokens2({ api, owner: VAULT, tokens });
}

module.exports = {
  methodology:
    "TVL is the USD value of all Robinhood Chain Stock Tokens (tokenized equities, priced via Chainlink) held in the RBDXVault contract, which backs the RBDX index token 1:1 by NAV.",
  start: "2026-09-06",
  robinhood: { tvl },
};
