const ADDRESSES = require('../helper/coreAssets.json')

const COLLATERALS = {
  WASTAR: {
    tokenAddress: "0x19574c3c8fafc875051b665ec131b7e60773d2c9",
    contracts: {
      activePool: "0x70724b57618548eE97623146F76206033E67086e",
      defaultPool: "0x2fE3FDf91786f75C92e8AB3B861588D3D051D83F",
    }
  },
  BUSD: {
    tokenAddress: ADDRESSES.oasis.ceUSDT,
    bridgeTokenMapping: ADDRESSES.ethereum.BUSD,
    contracts: {
      activePool: "0x892af684Afd5fCee1023f7811C35fd695Bf0cd6f",
      defaultPool: "0xe487b9066A8fFde840b29892f1052CBEdccc3073",
    }
  },
  DAI: {
    tokenAddress: ADDRESSES.astar.DAI,
    bridgeTokenMapping: ADDRESSES.ethereum.DAI,
    contracts: {
      activePool: "0xCE90059FbCEc696634981945600d642A79e262aD",
      defaultPool: "0x3aD8FE12674B4c9481d5C7585ed5bDC4E35025b9",
    }
  },
  DOT: {
    tokenAddress: ADDRESSES.astar.DOT,
    contracts: {
      activePool: "0x8cd0b101838b082133e25eEb76C916Ae2AC56f36",
      defaultPool: "0x4e8B4867899A69bB05EFa6A16e68363C2BBeB02f",
    }
  },
  USDC: {
    tokenAddress: ADDRESSES.moonbeam.USDC,
    bridgeTokenMapping: ADDRESSES.ethereum.USDC,
    contracts: {
      activePool: "0x5070d543654D866964C44E610a3b7f85fcAf2859",
      defaultPool: "0xEb80f1a9ede36412cF26E1e35ae74dbA30cCfF02",
    }
  },
  WETH: {
    tokenAddress: ADDRESSES.moonbeam.USDT,
    contracts: {
      activePool: "0x5Ec419F08602caE5e4C591dE65bD640d66673035",
      defaultPool: "0x2eE0F3daa042af6Fdd56f0194d5aBfdA0A723D95",
    }
  },
  WBTC: {
    tokenAddress: ADDRESSES.astar.WBTC,
    bridgeTokenMapping: ADDRESSES.ethereum.WBTC,
    contracts: {
      activePool: "0x1685E4f68FD9A50246ce92F0eb07a977591F5Ba2",
      defaultPool: "0xD69eB04d9ff456A31Da6D2a20538512C433ac1Ca",
    }
  },
  USDT: {
    tokenAddress: ADDRESSES.astar.USDT,
    bridgeTokenMapping: ADDRESSES.ethereum.USDT,
    contracts: {
      activePool: "0x74dFF63491B39E5fFE0Be44Ee3B23F674C27DB7c",
      defaultPool: "0x8EE2f5403246b86d7493ddCeED19f9347bc4DF1D",
    }
  },
}

const BRIDGE_TOKEN_MAPPINGS = {}
for (const collateralInfo of Object.values(COLLATERALS)) {
  if (collateralInfo.bridgeTokenMapping) {
    BRIDGE_TOKEN_MAPPINGS[collateralInfo.tokenAddress] = collateralInfo.bridgeTokenMapping;
  }
}

async function tvl(api) {
  const tokensAndOwners = []
  for (const collateralInfo of Object.values(COLLATERALS)) {
    const _tokensAndOwners = Object.values(collateralInfo.contracts).map(owner => [collateralInfo.tokenAddress, owner])
    tokensAndOwners.push(..._tokensAndOwners)
  }

  return api.sumTokens({ tokensAndOwners, })
}

module.exports = {
  methodology: "Total locked collateral assets (in ERC-20 form) in ActivePool and DefaultPool",
  astar: {
    tvl,
  },
};
