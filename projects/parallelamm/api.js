const { getAPI, getTokenPrices } = require('../helper/acala/api')
// const { log } = require('../helper/utils')
// const { stringToU8a, u8aConcat, bnToU8a } = require('@polkadot/util')
// // const { blake2AsU8a } = require('@polkadot/util-crypto')
// const { encodeAddress, decodeAddress, } = require('@polkadot/keyring')
// const EMPTY_U8A_32 = new Uint8Array(32)
// const createAddress = id => encodeAddress(u8aConcat(stringToU8a(`modl${id}`), EMPTY_U8A_32).subarray(0, 32))

module.exports = {
  misrepresentedTokens: true,
  parallel: {
    tvl: async () => {
      const chain = 'parallel'
      const api = await getAPI(chain)
      return getAMMData(api, chain)
    }
  },
  heiko: {
    tvl: async () => {
      const chain = 'heiko'
      const api = await getAPI(chain)
      return getAMMData(api, chain)
    }
  },
};

// Taken from https://raw.githubusercontent.com/parallel-finance/amm-subql/883b278116a6252363387f1246a7f248b6cb1e7b/src/mappings/lpTokenPriceHandler.ts
async function getAMMData(api, chain) {
  const { balances } = await getTokenPrices({ api, chain })
  // const poolAccount = createAddress('par/ammp')
  return balances
}
