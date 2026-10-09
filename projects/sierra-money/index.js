const ADDRESSES = require('../helper/coreAssets.json');
const abi = "function getPoolDynamicAccountState(address lender) public view returns (tuple(address poolAddr, address accountAddr, address liquidityAssetAddr, uint256 tokenBalance, uint256 assetBalance, uint256 maxWithdrawRequest, uint256 maxRedeemRequest, uint256 requestedSharesOf, uint256 requestedAssetsOf, uint256 acceptedShares, uint256 acceptedAssets, uint256 assetsDeposited, uint256 assetsWithdrawn) _poolAccountState)"

// Owners of reserves backing SIERRA. Same EOAs across all supported chains.
// See https://docs.sierra.money/reserves-management/reserve-strategy
const owners = [
  "0x2071D1689D85De2b49004D257f99802A25BF4fe7",
  "0xf1F925D1F6b36bC9344d6Afe39DC1637b778dE41",
  "0xBC7C0b1b9C61f35068561077FbaA163707128597",
];

// OpenTrade vaults per chain. Add new vaults here as they are deployed.
const openTradeVaultsByChain = {
  ethereum: [
    "0xe1b1252652A2FF0CC3A4214eE73d9FeD1FEa5b4f", // OpenTrade xSOLY Vault
    "0xbC8573433C06746f495942C0B30e2DC9A11d70Bd", // OpenTrade xPPV-USDCEth Vault
  ],
  avax: [
    "0x09Ca60Ca323a6313aE144778c3EbDfCCFBB5e5D2", // OpenTrade XMMF Vault
    "0x3458F1Cab06cdf7C9323d8FffB04093F9D8380b6", // OpenTrade xMorphoGPUSDC-Base Vault
    "0x0E57DFcF4A53cd1A19256Bd2aF8bC28a9AC7EBE8", // OpenTrade xIGCP Vault
    "0x6bCB49378Fad952f0fd6Bbdc2cAFf9cc76D5D408", // OpenTrade xUSCLO Vault
    "0xd1F0cC4F765035903bb1fD43095853714Aa4C290", // OpenTrade xTradeflowCEMP90-USDCAva-1 Vault
  ],
  plume_mainnet: [
    "0xA4433b4fd89c9358f4013212De04bcb8BCE68213", // OpenTrade xDLF Vault
  ],
};

// Reserve tokens tracked in owner wallets, per chain.
const reserveTokensByChain = {
  ethereum: [ADDRESSES.ethereum.USDC],
  avax: [ADDRESSES.avax.USDC],
  plume_mainnet: [ADDRESSES.plume_mainnet.USDC],
};

async function tvl(api) {
  const openTradeVaults = openTradeVaultsByChain[api.chain] || [];
  const reserveTokens = reserveTokensByChain[api.chain] || [];

  // Reserve stables held in owner wallets on this chain
  if (reserveTokens.length) {
    await api.sumTokens({ owners, tokens: reserveTokens });
  }

  // Assets staked in OpenTrade vaults for each owner on this chain
  if (openTradeVaults.length) {
    const calls = openTradeVaults.flatMap(vault =>
      owners.map(owner => ({ target: vault, params: owner }))
    );
    const openTradeBalances = await api.multiCall({ abi, calls });
    openTradeBalances.forEach(i => api.add(i.liquidityAssetAddr, i.assetBalance));
  }
}

module.exports = {
  methodology: 'TVL includes USDC held in the reserve wallets and assets staked in OpenTrade vaults backing SIERRA tokens, summed across all supported chains.',
};

Object.keys(openTradeVaultsByChain).forEach(chain => {
  module.exports[chain] = { tvl };
});
