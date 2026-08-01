const abi = {
  "getSmartVaultAssetBalances": "function getSmartVaultAssetBalances(address, bool) external returns (uint256[] memory)"
}

const ethContract = "0x5d6ac99835b0dd42ed9ffc606170e59f75a88fde";
const spoolLens = '0x8aa6174333F75421903b2B5c70DdF8DA5D84f74F';

async function eth(api) {
  const tvlETH = await api.call({
    target: spoolLens,
    abi: abi["getSmartVaultAssetBalances"],
    params: [ethContract, false]
  });
  api.addGasToken(tvlETH[0])
  return api.getBalances()
}

module.exports = {
  methodology: 'TVL is counted as deposits routed to the underlying Liquid Staking protocols in the vault.',
  doublecounted: true, // tokens are stored in underlying LSDs
  misrepresentedTokens: true,
  ethereum: {
    tvl: eth
  }
}
