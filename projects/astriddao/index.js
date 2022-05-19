const { sumTokens } = require('../helper/unwrapLPs')
const { getFixBalances } = require('../helper/portedTokens')

const chain = 'astar'

const COLLATERALS = {
  WASTAR: {
    tokenAddress: "0x19574c3c8fafc875051b665ec131b7e60773d2c9",
    contracts: {
      activePool: "0x70724b57618548eE97623146F76206033E67086e",
      defaultPool: "0x2fE3FDf91786f75C92e8AB3B861588D3D051D83F",
    }
  },
  BUSD: {
    tokenAddress: "0x4Bf769b05E832FCdc9053fFFBC78Ca889aCb5E1E",
    bridgeTokenMapping: "0x4fabb145d64652a948d72533023f6e7a623c7c53",
    contracts: {
      activePool: "0x892af684Afd5fCee1023f7811C35fd695Bf0cd6f",
      defaultPool: "0xe487b9066A8fFde840b29892f1052CBEdccc3073",
    }
  }
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
  balances = translateBalancesForBridgeToken(balances)
  ;(await getFixBalances(chain))(balances)
  return balances
}

module.exports = {
  timetravel: true,
  start: 915830,
  methodology: "Total locked ASTR (in wrapped ERC-20 form) in ActivePool and DefaultPool",
  astar: {
    tvl,
  },
};
