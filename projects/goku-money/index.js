const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens } = require('../helper/unwrapLPs')

const chain = 'manta'

const COLLATERALS = {
  USDC: {
    tokenAddress: ADDRESSES.manta.USDC,
    contracts: {
      activePool: "0x50ef8B64c02B7913f15CbCDF0E7F44CC261195D6",
      defaultPool: "0xac84B99F253F05b00bff36a06fA1CA5f5754E80F",
    }
  },

  USDT: {
    tokenAddress: ADDRESSES.manta.USDT,
    contracts: {
      activePool: "0x74242b001869037594c8b59b191DF7284c6A3801",
      defaultPool: "0xF42cE1F6F90Ea3B6254E2390B7E9467Fb1584AAA",
    }
  },

  TIA: {
    tokenAddress: "0x6Fae4D9935E2fcb11fC79a64e917fb2BF14DaFaa",
    contracts: {
      activePool: "0x00A14CF3A66De2D4585F399Ed4240d0F2730fFCB",
      defaultPool: "0x6851255D2CEc9D66502282D3C6F11f552186eDA7",
    }
  },

  WETH: {
    tokenAddress: ADDRESSES.manta.WETH,
    contracts: {
      activePool: "0xd58300481551F2bB81343abB5C6288fEaCC72Be4",
      defaultPool: "0x2C903a6858374925f5020B8EA2D88E545515eD4D",
    }
  },
}

const GAI_TOKEN_ADDRESS = "0xcd91716ef98798A85E79048B78287B13ae6b99b2"
const STAKES = {
  USDC: {
    contracts: {
      stabilityPool: "0xC5392Be704A4654444CcEE4A8407cbF4A0ed5F2A"
    }
  },
  USDT: {
    contracts: {
      stabilityPool: "0x000aF1623BeCcd809c51cD2440cc8E1B55D191b4"
    }
  },
  TIA: {
    contracts: {
      stabilityPool: "0x333E6492B5c2eAfAFCB709c5914D53b01C640b33"
    }
  },
  WETH: {
    contracts: {
      stabilityPool: "0x5E9924f545Ed8116b1Ae4315653e1b0E52a2bfc4"
    }
  },
}

const GOK_TOKEN_ADDRESS = '0x387660BC95682587efC12C543c987ABf0fB9778f'
const GOK_STAKES = {
  USDC: {
    contracts: {
      gokStaking: "0x60e47C06E3999c1Ef8bC5A424FCd665925CB0FB1"
    }
  },
  USDT: {
    contracts: {
      gokStaking: "0x1343804D5936EA6E98988F27870b913b1c93081e"
    }
  },
  TIA: {
    contracts: {
      gokStaking: "0xD2fBB34Bd69EC810AF2D243eA2192e7c89a696dA"
    }
  },
  WETH: {
    contracts: {
      gokStaking: "0x4CF0Ac5Ac97E8d58e798eBc4EaB9afF17481c5F5"
    }
  },
}

const BRIDGE_TOKEN_MAPPINGS = {}
for (const collateralInfo of Object.values(COLLATERALS)) {
  if (collateralInfo.bridgeTokenMapping) {
    BRIDGE_TOKEN_MAPPINGS[collateralInfo.tokenAddress] = collateralInfo.bridgeTokenMapping;
  }
}

function translateBalancesForBridgeToken(balances) {
  const translatedBalances = {};
  for (const key in balances) {
    if (key in BRIDGE_TOKEN_MAPPINGS) {
      translatedBalances[BRIDGE_TOKEN_MAPPINGS[key]] = balances[key]
    } else {
      translatedBalances[key] = balances[key]
    }
  }
  return translatedBalances
}

async function tvl(ts, _block, chainBlocks ) {
  const block = chainBlocks[chain]
  let balances = {}
  for (const collateralInfo of Object.values(COLLATERALS)) {
    const tokensAndOwners = Object.values(collateralInfo.contracts).map(owner => [collateralInfo.tokenAddress, owner])
    await sumTokens(balances, tokensAndOwners, block, chain)
  }

  for (const stakeInfo of Object.values(STAKES)) {
    const tokensAndOwners = Object.values(stakeInfo.contracts).map(owner => [GAI_TOKEN_ADDRESS, owner])
    await sumTokens(balances, tokensAndOwners, block, chain)
  }

  for (const atidStakeInfo of Object.values(GOK_STAKES)) {
    const tokensAndOwners = Object.values(atidStakeInfo.contracts).map(owner => [GOK_TOKEN_ADDRESS, owner])
    await sumTokens(balances, tokensAndOwners, block, chain)
  }

  balances = translateBalancesForBridgeToken(balances)

  return balances
}

module.exports = {
  timetravel: true,
  start: 1698768000, // 01 Nov 2023
  methodology: "Total locked collateral assets (in ERC-20 form) in ActivePool and DefaultPool, plus total staked GAI in StabilityPool",
  manta: {
    tvl,
  },
};
