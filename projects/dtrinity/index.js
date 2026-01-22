const ADDRESSES = require('../helper/coreAssets.json')
const config = {
  fraxtal: {
    dUSD: {
      address: '0x0B0BD5F8A6f4c72a09748fA915Af12Ca423B7240',
      collateralVault: "0x624E12dE7a97B8cFc1AD1F050a1c9263b1f4FeBC",
      pools: [{
        // Curve frxUSD/dUSD
        lpAddress: '0x9CA648D2f51098941688Db9a0beb1DadC2D1B357',
        collateralAddress: ADDRESSES.fraxtal.FRAX,
        amoVault: '0x0B0BD5F8A6f4c72a09748fA915Af12Ca423B7240'
      }, {
        // Curve dUSD/sfrxUSD
        lpAddress: '0x5eCFA6940a33A2dAd5c473896452f018c6c04577',
        collateralAddress: '0xfc00000000000000000000000000000000000008',
        amoVault: '0x0B0BD5F8A6f4c72a09748fA915Af12Ca423B7240'
      }, {
        // Curve dUSD/sUSDe
        lpAddress: '0xF16f226Baa419d9DC9D92C040CCBC8c0E25F36D7',
        collateralAddress: ADDRESSES.arbitrum.sUSDe,
        amoVault: '0x0B0BD5F8A6f4c72a09748fA915Af12Ca423B7240'
      }],
    },
  },
  sonic: {
    dUSD: {
      address: '0x53a6aBb52B2F968fA80dF6A894e4f1b1020DA975',
      collateralVault: "0xD6BBab428240c6a4e093E13802f2eCa3E9F0De7d",
      pools: []
    },
    dS: {
      address: '0x614914B028A7D1fD4Fab1E5a53a3E2dF000bcB0e',
      collateralVault: "0xc1A09c3443d578a85DE35368a1a58E8989F4721b",
      pools: []
    }
  },
   katana: {
    dUSD: {
      address: '0xcA52d08737E6Af8763a2bF6034B3B03868f24DDA',
      collateralVault: "0xA5f9F6238406B1301D0ED09555a2893dc1A26A49",
      pools: []
    },
  },
  ethereum: {
    dUSD: {
      address: '0x07fFf99e1664d9B116fbC158c0E99785F81cA236',
      collateralVault: '0x84c58066a4408454b7380f168c95F571419253f4',
      pools: []
    },
  }
}

async function getAMOTvl(api) {
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
  methodology: 'Includes TVL for dLEND and TVL for dSTABLEs (dUSD, dS, dETH).',
  fraxtal: {
    tvl: getAMOTvl
  },
  sonic: {
    tvl: getAMOTvl,
  },
  katana: {
    tvl: getAMOTvl,
  },
  ethereum: {
    tvl: getAMOTvl,
  },
};
