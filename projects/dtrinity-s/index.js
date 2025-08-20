const ADDRESSES = require('../helper/coreAssets.json')
const config = {
  sonic: {
    dS: {
      address: '0x614914B028A7D1fD4Fab1E5a53a3E2dF000bcB0e',
      collateralVault: "0xc1A09c3443d578a85DE35368a1a58E8989F4721b",
      pools: []
    }
  },
}

async function getCollateralTvl(api) {
  const networkConfig = config[api.chain]
  if (!networkConfig) return


  for (const [, tokenConfig] of Object.entries(networkConfig)) {
    // Process pools if they exist
    if (tokenConfig.pools) {
      for (const pool of tokenConfig.pools) {
        const lpBal = await api.call({ abi: 'erc20:balanceOf', target: pool.lpAddress, params: pool.amoVault })
        const collateralBal = await api.call({ abi: 'erc20:balanceOf', params: pool.lpAddress, target: pool.collateralAddress })
        const lpSupply = await api.call({ abi: 'erc20:totalSupply', target: pool.lpAddress })
        const collateralAmount = collateralBal * lpBal / lpSupply
        api.add(pool.collateralAddress, collateralAmount)
      }
    }

    // Process collateral vault
    const collaterals = await api.call({ abi: 'address[]:listCollateral', target: tokenConfig.collateralVault })
    await api.sumTokens({ owner: tokenConfig.collateralVault, tokens: collaterals })
  }

}

module.exports = {
  methodology: 'TVL of dS collaterals',
  sonic: {
    tvl: getCollateralTvl,
  },
};