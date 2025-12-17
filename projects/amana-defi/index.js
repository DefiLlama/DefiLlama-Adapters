const ADDRESSES = require('../helper/coreAssets.json')
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
  ["0xe5fa0E4BA13D516908c5313b3375b7Ede24BFe7a", ADDRESSES.zeta.USDT_1], // Aave USDT
  
  // Ethereum vault - holds ETH.ETH ZRC20
  ["0xF4FA4D8115e78ACf52308FDBad10A5f9042991DE", ADDRESSES.zeta.ETH], // Curve-Convex msETH/WETH
  
  // Curve Convex USDC Vault -> Arbitrum -> USDC.ARB
  ["0x32fECdEf376E2aD74C53663BDE933116C09408f3", "0x0327f0660525b15Cdb8f1f5FBF0dD7Cd5Ba182aD"], // Curve-Convex eUSD/USDC
  
  // Curve Convex USDT Vault -> Ethereum -> USDT.ETH
  ["0x0552d4c51491d9bfed97eb795e101e90a5f16d44", ADDRESSES.zeta.USDT], 

  // Balancer USDC Vault -> Base -> USDC.BASE
  ["0x8b934de59fde50a91daa7e788389f8fcad35a14f", "0x96152E6180E085FA57c7708e18AF8F05e37B479D"],

  // YieldFi USDC Vault -> Ethereum -> USDC.ETH
  ["0xcf18fc631e05ba7dcbcadcd212176c381256faa8", ADDRESSES.zeta.USDC_1], 

  // Aegis USDT Vault -> BNB -> USDT.BSC
  ["0x0552d4c51491d9bfed97eb795e101e90a5f16d44", ADDRESSES.zeta.USDT_1], 

  // Curve Convex cbBTC Vault -> Ethereum -> CBBTC.ETH
  ["0x5e3adc840b55fe0b99c0418ac69113e1f0296992", "0x3e128c169564DD527C8e9bd85124BF6A890E5a5f"], 

  // Curve Convex USDf Vault -> Ethereum -> USDC.ETH
  ["0xe501cbd03fa739273f49a8b54dd49de1248101f6", ADDRESSES.zeta.USDC_1], 

  // Noon Capital sUSN Vault -> Ethereum -> USDC.ETH
  ["0x8426929d568b1cbc281f5787556f84c5b101399d", ADDRESSES.zeta.USDC_1], 
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