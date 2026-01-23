/**
 * dTrinity Protocol Configuration
 * 
 * TVL = total collateral backing dSTABLEs:
 * - Vault deposits (collateralVault.listCollateral)
 * - Curve LP positions in AMO wallet (staked in StakeDAO/Convex or unstaked)
 * 
 * amoCurveLPTokens: { address, lpToken }
 * - address === lpToken: unstaked raw LP tokens
 * - address !== lpToken: LP staked in wrapper (StakeDAO/Convex)
 */
const { sumTokens2 } = require('../helper/unwrapLPs')

const config = {
  fraxtal: {
    dUSD: {
      collateralVault: '0x624E12dE7a97B8cFc1AD1F050a1c9263b1f4FeBC',
      amoSafeWallet: '0xdb104e0bb0b2955f69e8e092eb80831913d85431',
      amoDebtToken: '0x3E17fd53FcB2Dbd409B92f4860326B8b880e3c28', // excluded from collateral list
      // dUSD/sfrxUSD Curve LP (0x5eCF...) - coins: [dUSD, sfrxUSD]
      amoCurveLPTokens: [
        { address: '0xF5572d8D01bb6F96403f477D8B3Bfb5739444702', lpToken: '0x5eCFA6940a33A2dAd5c473896452f018c6c04577' }, // StakeDAO staked
        { address: '0x9886AD218f646Ad67B5D057953B2d25bD0172AFD', lpToken: '0x5eCFA6940a33A2dAd5c473896452f018c6c04577' }, // Convex
        { address: '0x46478563d4532Ef2b68A328c3F528B19626f2E54', lpToken: '0x5eCFA6940a33A2dAd5c473896452f018c6c04577' }, // StakeDAO
        { address: '0x5eCFA6940a33A2dAd5c473896452f018c6c04577', lpToken: '0x5eCFA6940a33A2dAd5c473896452f018c6c04577' }  // unstaked raw LP
      ]
    }
  },
  ethereum: {
    dUSD: {
      collateralVault: '0x84c58066a4408454b7380f168c95F571419253f4',
      amoSafeWallet: '0x38262EFFcD17cd64f6311EF688B2CAa61102f3dB',
      amoDebtToken: '0x55a626E2f9DF98eC09A8898363c26bcB396b098d', // excluded from collateral list
      // dUSD/sfrxUSD Curve LP (0x2C2A...) - coins: [dUSD, sfrxUSD]
      amoCurveLPTokens: [
        { address: '0x91c95bb84aa561d93d165ff24d0e54e6b006447c', lpToken: '0x2C2A700766886290359ccf39Cb2173a39af1CEf9' } // StakeDAO
      ]
    }
  },
  sonic: {
    dUSD: {
      collateralVault: '0xD6BBab428240c6a4e093E13802f2eCa3E9F0De7d',
    },
    dS: {
      collateralVault: '0xc1A09c3443d578a85DE35368a1a58E8989F4721b',
    }
  },
  katana: {
    dUSD: {
      collateralVault: '0xA5f9F6238406B1301D0ED09555a2893dc1A26A49',
    }
  }
}

async function getCurveLPValue(api, tokenConfig) {
  if (!tokenConfig.amoSafeWallet || !tokenConfig.amoCurveLPTokens?.length) return

  const lpTokens = [...new Set(tokenConfig.amoCurveLPTokens.map(t => t.lpToken))]
  const lpData = {}

  for (const lpToken of lpTokens) {
    try {
      const [balances, totalSupply, coin0, coin1] = await Promise.all([
        api.call({ abi: 'function get_balances() view returns (uint256[])', target: lpToken }),
        api.call({ abi: 'erc20:totalSupply', target: lpToken }),
        api.call({ abi: 'function coins(uint256) view returns (address)', target: lpToken, params: [0] }),
        api.call({ abi: 'function coins(uint256) view returns (address)', target: lpToken, params: [1] })
      ])
      lpData[lpToken] = { balances, totalSupply, coins: [coin0, coin1] }
    } catch (e) {
      console.error(`Failed to get LP data for ${lpToken}:`, e.message)
    }
  }

  for (const lpConfig of tokenConfig.amoCurveLPTokens) {
    try {
      const wrapperBalance = await api.call({
        abi: 'erc20:balanceOf',
        target: lpConfig.address,
        params: [tokenConfig.amoSafeWallet]
      })

      if (!wrapperBalance || wrapperBalance === '0') continue

      const lp = lpData[lpConfig.lpToken]
      if (!lp || !lp.totalSupply || lp.totalSupply === '0') continue

      for (let i = 0; i < lp.coins.length; i++) {
        const coinAddress = lp.coins[i]
        const poolBalance = lp.balances[i]
        const proportionalAmount = BigInt(poolBalance) * BigInt(wrapperBalance) / BigInt(lp.totalSupply)
        
        if (proportionalAmount > 0n) {
          api.add(coinAddress, proportionalAmount.toString())
        }
      }
    } catch (e) {
      console.error(`Failed to process wrapper ${lpConfig.address}:`, e.message)
    }
  }
}

async function getTvl(api) {
  const networkConfig = config[api.chain]
  if (!networkConfig) return

  for (const [, tokenConfig] of Object.entries(networkConfig)) {
    let collaterals = await api.call({ abi: 'function listCollateral() view returns (address[])', target: tokenConfig.collateralVault })
    
    if (tokenConfig.amoDebtToken) {
      const debtTokenLower = tokenConfig.amoDebtToken.toLowerCase()
      collaterals = collaterals.filter(addr => addr.toLowerCase() !== debtTokenLower)
    }
    
    await sumTokens2({ api, owner: tokenConfig.collateralVault, tokens: collaterals })
    await getCurveLPValue(api, tokenConfig)
  }
}

module.exports = {
  methodology: 'TVL is the total value of collateral backing dSTABLEs, including vault deposits and Curve LP positions.',
  fraxtal: { tvl: getTvl },
  ethereum: { tvl: getTvl },
  sonic: { tvl: getTvl },
  katana: { tvl: getTvl },
}
