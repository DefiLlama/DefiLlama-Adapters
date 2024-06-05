const ADDRESSES = require('../helper/coreAssets.json')

// Anzen Secured Private Credit Token
// minted by depositing USDC
const SPCT = '0xEf5AAcB3c38a5Be7785a361008e27fb0328a62B5';

async function tvl(api) {
  const uTokens = await api.multiCall({ abi: 'address:usdc', calls: [SPCT] })
  const bals = (await api.multiCall({ abi: 'uint256:totalPooledUSD', calls: [SPCT] })).map(i => i / 1e12)

  api.add(uTokens, bals)
  return api.getBalances()
}

async function borrowed(api) {
  // Borrowed amount in shares of pool
  const executedShares = await api.call({
    target: SPCT,
    abi: 'uint256:executedShares'
  });

  // Borrowed amount in USD
  const pooledUSDByShares = await api.call({
    target: SPCT,
    abi: 'function getPooledUSDByShares(uint256 _sharesAmount) public view returns (uint256)',
    params: [executedShares]
  });

  api.add(ADDRESSES.ethereum.USDC, pooledUSDByShares/1e12);
  return api.getBalances()
}

module.exports = {
  methodology: "Sums the total USDC value deposited to mint SPCT.",
  misrepresentedTokens: true,
  ethereum: {
    tvl,
    borrowed,
  },
};
