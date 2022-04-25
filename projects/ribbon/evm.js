const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { staking } = require("../helper/staking");

// Ethereum Vaults
const ethCallVault = "0x0fabaf48bbf864a3947bdd0ba9d764791a60467a";
const ethCallVaultV2 = "0x25751853Eab4D0eB3652B5eB6ecB102A2789644B";
const wbtcCallVault = "0x8b5876f5B0Bf64056A89Aa7e97511644758c3E8c";
const wbtcCallVaultV2 = "0x65a833afDc250D9d38f8CD9bC2B1E3132dB13B2F";
const usdcETHPutVault = "0x16772a7f4a3ca291C21B8AcE76F9332dDFfbb5Ef";
const yvUSDCETHPutVault = "0x8FE74471F198E426e96bE65f40EeD1F8BA96e54f";
const yvUSDCETHPutVaultV2 = "0xCc323557c71C0D1D20a1861Dc69c06C5f3cC9624";
const aaveCallVault = "0xe63151A0Ed4e5fafdc951D877102cf0977Abd365";
const stETHCallVault = "0x53773E034d9784153471813dacAFF53dBBB78E8c";
const apeCallVault = "0xc0cF10Dd710aefb209D9dc67bc746510ffd98A53";

// Avalanche Vaults
const avaxCallVault = "0x98d03125c62DaE2328D9d3cb32b7B969e6a87787";
const savaxCallVault = "0x6BF686d99A4cE17798C45d09C21181fAc29A9fb3";
const usdcAvaxPutVault = "0x9DD6be071b4292cc88B8190aB718329adEA3E3a3";

// Treasury Vaults
const perpCallVault = "0xe44eDF7aD1D434Afe3397687DD0A914674F2E405";

// Ethereum Assets
const weth = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
const wbtc = "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599";
const usdc = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const aave = "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9";
const perp = "0xbC396689893D065F41bc2C6EcbeE5e0085233447";
const ape = "0x4d224452801ACEd8B2F0aebE155379bb5D594381";

// Avalanche Assets
const wavax = "avax:0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7";
const savax = "avax:0x2b2C81e08f1Af8835a78Bb2A90AE924ACE0eA4bE";
const usdce = "avax:0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664";

async function addVault(balances, vault, token, block, chain = "ethereum") {
  const totalBalance = await sdk.api.abi.call({
    target: vault,
    block,
    abi: abi.totalBalance,
    chain,
  });
  sdk.util.sumSingleBalance(balances, token, totalBalance.output);
}

async function ethTvl(_, block) {
  const balances = {};
  await Promise.all([
    addVault(balances, ethCallVault, weth, block),
    addVault(balances, ethCallVaultV2, weth, block),
    addVault(balances, wbtcCallVault, wbtc, block),
    addVault(balances, wbtcCallVaultV2, wbtc, block),
    addVault(balances, usdcETHPutVault, usdc, block),
    addVault(balances, yvUSDCETHPutVault, usdc, block),
    addVault(balances, yvUSDCETHPutVaultV2, usdc, block),
    addVault(balances, aaveCallVault, aave, block),
    addVault(balances, stETHCallVault, weth, block),
    addVault(balances, perpCallVault, perp, block),
    addVault(balances, apeCallVault, ape, block),
  ]);
  return balances;
}

async function avaxTvl(_, block) {
  const balances = {};
  await Promise.all([
    addVault(balances, avaxCallVault, wavax, block, "avax"),
    addVault(balances, savaxCallVault, savax, block, "avax"),
    addVault(balances, usdcAvaxPutVault, usdce, block, "avax"),
  ]);
  return balances;
}

/**
 * STAKING
 */
const RBN = "0x6123B0049F904d730dB3C36a31167D9d4121fA6B";
const veRBN = "0x19854C9A5fFa8116f48f984bDF946fB9CEa9B5f7";
const veRBNStaking = staking(veRBN, RBN, "ethereum");

module.exports = {
  ethereum: {
    tvl: ethTvl,
    staking: veRBNStaking,
  },
  avalanche: {
    tvl: avaxTvl,
  },
};
