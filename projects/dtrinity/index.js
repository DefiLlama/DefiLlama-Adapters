const config = {
  fraxtal: {
    dUSD: {
      address: '0x0B0BD5F8A6f4c72a09748fA915Af12Ca423B7240',
      collateralVault: "0x624E12dE7a97B8cFc1AD1F050a1c9263b1f4FeBC",
      pools: [{
        // Curve frxUSD/dUSD
        lpAddress: '0x9CA648D2f51098941688Db9a0beb1DadC2D1B357',
        collateralAddress: '0xfc00000000000000000000000000000000000001',
      }, {
        // Curve dUSD/sfrxUSD
        lpAddress: '0x5eCFA6940a33A2dAd5c473896452f018c6c04577',
        collateralAddress: '0xfc00000000000000000000000000000000000008',
      }, {
        // Curve dUSD/sUSDe
        lpAddress: '0xF16f226Baa419d9DC9D92C040CCBC8c0E25F36D7',
        collateralAddress: '0x211Cc4DD073734dA055fbF44a2b4667d5E5fE5d2',
      }],
    },
  },
  sonic: {
    dUSD: {
      address: '0x53a6aBb52B2F968fA80dF6A894e4f1b1020DA975',
      collateralVault: "0xD6BBab428240c6a4e093E13802f2eCa3E9F0De7d",
      pools: [{
        // SwapX frxUSD/dUSD
        lpAddress: '0x695Df464b14B005cBB832312cF78AD9CE3eb93aB',
        collateralAddress: '0x80Eede496655FB9047dd39d9f418d5483ED600df',

      }, {
        // SwapX dUSD/wstkscUSD
        lpAddress: '0xcE901BABC183d89eC27B6a2FBA16B852139755a8',
        collateralAddress: '0x9fb76f7ce5FCeAA2C42887ff441D46095E494206',
      }]
    },
    dS: {
      address: '0x614914B028A7D1fD4Fab1E5a53a3E2dF000bcB0e',
      collateralVault: "0xc1A09c3443d578a85DE35368a1a58E8989F4721b",
      pools: [{
        // SwapX dS/stS
        lpAddress: '0x0373eB61C0a7d225b62a9D1db571b39C4952f0F8',
        collateralAddress: '0xE5DA20F15420aD15DE0fa650600aFc998bbE3955',
      }]
    }
  }
}

async function getFraxtalAMOTvl(api, network) {
  const networkConfig = config[network].dUSD
  if (!networkConfig) return

  // Process each pool in the array
  for (const pool of networkConfig.pools) {
    const lpBal = await api.call({ abi: 'erc20:balanceOf', target: pool.lpAddress, params: networkConfig.address })
    const collateralBal = await api.call({ abi: 'erc20:balanceOf', params: pool.lpAddress, target: pool.collateralAddress })
    const lpSupply = await api.call({ abi: 'erc20:totalSupply', target: pool.lpAddress })
    const collateralAmount = collateralBal * lpBal / lpSupply
    api.add(pool.collateralAddress, collateralAmount)
  }

  const tokens = await api.call({ abi: 'address[]:listCollateral', target: networkConfig.collateralVault })
  return api.sumTokens({ owner: networkConfig.collateralVault, tokens })
}

async function getSonicAMOTvl(api, network) {
  const networkConfig = config[network]
  if (!networkConfig) return

  const results = {}
  
  for (const [, tokenConfig] of Object.entries(networkConfig)) {
    if (!tokenConfig.pools) continue

    for (const pool of tokenConfig.pools) {
      const [reserve0, reserve1] = await api.call({ 
        abi: 'function getReserves() view returns (uint128, uint128)',
        target: pool.lpAddress
      })
      
      const token0 = await api.call({
        abi: 'function token0() view returns (address)',
        target: pool.lpAddress
      })
      const token1 = await api.call({
        abi: 'function token1() view returns (address)',
        target: pool.lpAddress
      })

      if (token0.toLowerCase() === pool.collateralAddress.toLowerCase()) {
        api.add(pool.collateralAddress, reserve0)
      } else if (token1.toLowerCase() === pool.collateralAddress.toLowerCase()) {
        api.add(pool.collateralAddress, reserve1)
      }
    }

    const collaterals = await api.call({ 
      abi: 'address[]:listCollateral', 
      target: tokenConfig.collateralVault 
    })
    
    const tokenResult = await api.sumTokens({ 
      owner: tokenConfig.collateralVault, 
      tokens: collaterals 
    })
    
    Object.assign(results, tokenResult)
  }

  return results
}

const tvl = async (api) => {
  const network = api.chain
  if (network === 'fraxtal') {
    return await getFraxtalAMOTvl(api, network)
  } else if (network === 'sonic') {
    return await getSonicAMOTvl(api, network)
  }
}

module.exports = {
  methodology: 'Includes TVL for dLEND and TVL for dUSD.',
  fraxtal: {
    tvl: (api) => tvl(api),
  },
  sonic: {
    tvl: (api) => tvl(api),
  }
};