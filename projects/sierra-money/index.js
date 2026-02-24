const ADDRESSES = require('../helper/coreAssets.json');

const abi = "function getPoolDynamicAccountState(address lender) public view returns (tuple(address poolAddr, address accountAddr, address liquidityAssetAddr, uint256 tokenBalance, uint256 assetBalance, uint256 maxWithdrawRequest, uint256 maxRedeemRequest, uint256 requestedSharesOf, uint256 requestedAssetsOf, uint256 acceptedShares, uint256 acceptedAssets, uint256 assetsDeposited, uint256 assetsWithdrawn) _poolAccountState)"

const openTradeVaults = [
  '0x09Ca60Ca323a6313aE144778c3EbDfCCFBB5e5D2', // OpenTrade XMMF Vault
  '0x3458F1Cab06cdf7C9323d8FffB04093F9D8380b6', // OpenTrade xMorphoGPUSDC-Base Vault
  '0x4a8094F20906a453a4A74769aa74c4012B0d5Df6', // OpenTrade xAaveUSDC-ETH Vault
  '0x4c8eaBA17c3b30295f442A6415d495e8410a5693', // OpenTrade xWildcatWMTUSDC-ETH Vault
  '0x27C3c978e3cBF383ed715D313A2e97c052FbbEe0', // OpenTrade xSOLY Vault
  '0x0E57DFcF4A53cd1A19256Bd2aF8bC28a9AC7EBE8' // OpenTrade xIGCP Vault
];

// Owner of reserves backing SIERRA, see https://debank.com/profile/0xBC7C0b1b9C61f35068561077FbaA163707128597 or https://docs.sierra.money/reserves-management/reserve-strategy
const owner = "0xBC7C0b1b9C61f35068561077FbaA163707128597"

async function tvl(api) {
  api.sumTokens({ owner, tokens: [ADDRESSES.avax.USDC] });

  // get tokens staked in openTrade
  const openTradeBalances = await api.multiCall({
    abi,
    calls: openTradeVaults.map(vault => ({ target: vault, params: owner, })),
  })

  openTradeBalances.forEach(i => api.add(i.liquidityAssetAddr, i.assetBalance));
}

module.exports = {
  methodology: 'TVL includes the USDC held in the multisig wallet and assets staked in OpenTrade vaults backing SIERRA tokens.',
  avax: {
    tvl,
  },
};
