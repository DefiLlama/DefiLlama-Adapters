// AmanaDefi TVL Adapter - Working Version using sumTokensExport

const { sumTokensExport } = require("../helper/unwrapLPs");

// Define vault addresses and their corresponding tokens
const vaultTokenPairs = [
  // Base vaults - both hold USDC.BASE ZRC20
  ["0x0F6514E3e4760eFc8f34fc67a05c4987367aF14e", "0x96152E6180E085FA57c7708e18AF8F05e37B479D"], // ZeroLend USDC
  ["0x5cD6e196CA1D85B8edFDf162d3A0C77268F42C69", "0x96152E6180E085FA57c7708e18AF8F05e37B479D"], // Fluid USDC
  
  // Polygon vault - holds USDT.POL ZRC20
  ["0x622E956626Cc6aBa655E3d92a3629b04cB038E80", "0xdbfF6471a79E5374d771922F2194eccc42210B9F"], // Compound USDT
  
  // BSC vault - holds USDT.BSC ZRC20
  ["0xe5fa0E4BA13D516908c5313b3375b7Ede24BFe7a", "0x91d4F0D54090Df2D81e834c3c8CE71C6c865e79F"], // Aave USDT
  
  // Ethereum vault - holds ETH.ETH ZRC20
  ["0xF4FA4D8115e78ACf52308FDBad10A5f9042991DE", "0xd97B1de3619ed2c6BEb3860147E30cA8A7dC9891"], // Curve-Convex msETH/WETH
  
  // Arbitrum vault - holds USDC.ARB ZRC20
  ["0x32fECdEf376E2aD74C53663BDE933116C09408f3", "0x0327f0660525b15Cdb8f1f5FBF0dD7Cd5Ba182aD"], // Curve-Convex eUSD/USDC
];

// Custom TVL function that handles the special case
async function zetachainTvl(api) {
  const vaultABI = "function totalAssets() external view returns (uint256)";
  
  for (const [vaultAddress, tokenAddress] of vaultTokenPairs) {
    const totalAssets = await api.call({
      target: vaultAddress,
      abi: vaultABI,
    });
    
    // Skip empty vaults
    if (totalAssets === "0" || totalAssets === 0) {
      continue;
    }
    
    // Add the token balance - let DefiLlama handle the token recognition
    api.add(tokenAddress, totalAssets);
  }
}

module.exports = {
  methodology: "AmanaDefi is a cross-chain yield farming protocol that manages ERC4626-compliant vaults on ZetaChain. Vaults hold ZRC20 tokens (ZetaChain's cross-chain representations) which are 1:1 pegged to native tokens on connected chains. TVL is calculated by summing totalAssets() of all vaults holding ZRC20 tokens.",
  zeta: {
    tvl: zetachainTvl,
  },
};