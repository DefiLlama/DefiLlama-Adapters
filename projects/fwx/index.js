const { getConfig } = require('../helper/cache')

module.exports = {
  avax: {
    tvl,
  },
  base: {
    tvl,
  },
  bsc: {
    tvl,
  }
}

const dexes = {
  avax: [
    "0x82E90fB94fd9a5C19Bf38648DD2C9639Bde67c74", // xliplessDex
  ],
  base: [
    "0xaf5a41Ad65752B3CFA9c7F90a516a1f7b3ccCdeD" // perp
  ],
  bsc: [
    "0x562a73AcfFcc13b349e3d55D105Ae1498C79702e" // perp
  ]
}

async function tvl(api) {
  const { assets } = await getConfig('fwx/' + api.chain, "https://analytics.fwx.finance/api/assets?chain_id=" + api.chainId)

  let tokensAndOwners = [];
  for (let i = 0; i < assets.length; i++) {
    const asset = assets[i]
    const tokenAddr = asset.token_address
    const poolAddr = asset.pool_address
    const coreAddr = asset.core_address
    const dexAddrs = dexes[api.chain]

    if (poolAddr != "") {
      tokensAndOwners.push(
        [tokenAddr, poolAddr],
      );
    }

    if (coreAddr != "") {
      tokensAndOwners.push(
        [tokenAddr, coreAddr],
      );
    }

    for (let i = 0; i < dexAddrs.length; i++) {
      const dexAddr = dexAddrs[i]
      tokensAndOwners.push(
        [tokenAddr, dexAddr],
      );
    }
  }

  return api.sumTokens({ tokensAndOwners })
}
