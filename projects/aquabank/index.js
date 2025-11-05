// projects/aquabank/index.js
const bUSDt = '0x3C594084dC7AB1864AC69DFd01AB77E8f65B83B7'


// AQUABANK TVL adapter
// bUSDT (bTether) is a fully backed wrapped USDt token on Avalanche.
// The underlying USDt is deposited into Benqi and Euler to earn yield.
// TVL reflects the total USDt-equivalent backing represented by bUSDT supply.

const tvl = async (api) => {
    const supply = await api.call({ abi: 'erc20:totalSupply', target: bUSDt })
    api.add(bUSDt, supply)
  }

module.exports = {
    methodology:
        'TVL is calculated based on the total supply of bUSDT, which is fully backed by USDt deposited into Benqi and Euler vaults. Each bUSDT represents 1 USDt of collateralized liquidity.',
    avax: { 
        tvl,
    },
}


