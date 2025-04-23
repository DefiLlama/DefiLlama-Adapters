const { sumTokens2 } = require('../helper/unwrapLPs');

const PORTFOLIO = ""; 
const DEPOSITOR_VAULT = "";

const ABI = {
  Portfolio: {
    getAssets: "function getAssets() view returns (tuple(address token, address custodian, address priceOracle, uint256 maxSupply, tuple(address callback, uint16 options)[] hooks)[])",
  },
  DepositorVault: {
    getTotalLiabilities: "function getTotalLiabilities() view returns (uint256)",
    getUnderlyingAsset: "function getUnderlyingAsset() view returns (address)"
  }
};

async function tvl(api) {
  const tokensAndOwners = [];
  
  const assets = await api.call({
    abi: ABI.Portfolio.getAssets,
    target: PORTFOLIO
  });
  
  for (const asset of assets) {
    tokensAndOwners.push([asset.token, asset.custodian]);
  }
  
  const underlyingAsset = await api.call({
    abi: ABI.DepositorVault.getUnderlyingAsset,
    target: DEPOSITOR_VAULT
  });
  
  tokensAndOwners.push([underlyingAsset, DEPOSITOR_VAULT]);
  
  return sumTokens2({ api, tokensAndOwners });
}

async function borrowed(api) {
  const underlyingAsset = await api.call({
    abi: ABI.DepositorVault.getUnderlyingAsset,
    target: DEPOSITOR_VAULT
  });
  
  const liabilities = await api.call({
    abi: ABI.DepositorVault.getTotalLiabilities,
    target: DEPOSITOR_VAULT
  });
  
  api.add(underlyingAsset, liabilities);
  return api.getBalances();
}

module.exports = {
  arbitrum: {
    tvl,
    borrowed,
  },
  methodology: "Gets the TVL for the protocol",
};
