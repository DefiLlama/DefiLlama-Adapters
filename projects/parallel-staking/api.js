const { getAPI } = require('../helper/acala/api')
const { log } = require('../helper/utils')
const { stringToU8a, u8aConcat, bnToU8a } = require('@polkadot/util')
// const { blake2AsU8a } = require('@polkadot/util-crypto')
const { encodeAddress, decodeAddress, } = require('@polkadot/keyring')
const EMPTY_U8A_32 = new Uint8Array(32)

// const sovereignAccountOf = (paraId) =>
//   encodeAddress(
//     u8aConcat(
//       stringToU8a('para'),
//       bnToU8a(paraId, 32, true),
//       EMPTY_U8A_32
//     ).subarray(0, 32)
//   )

// const subAccountId = (signer, index) => {
//   const seedBytes = stringToU8a('modlpy/utilisuba')
//   const whoBytes = decodeAddress(signer)
//   const indexBytes = bnToU8a(index, 16).reverse()
//   const combinedBytes = new Uint8Array(
//     seedBytes.length + whoBytes.length + indexBytes.length
//   )
//   combinedBytes.set(seedBytes)
//   combinedBytes.set(whoBytes, seedBytes.length)
//   combinedBytes.set(indexBytes, seedBytes.length + whoBytes.length)

//   const entropy = blake2AsU8a(combinedBytes, 256)
//   return encodeAddress(entropy)
// }

module.exports = {
  misrepresentedTokens: true,
  parallel: {
    tvl: async () => {
      const chain = 'parallel'
      const api = await getAPI(chain)

      return {
        polkadot: (await getStakedAmount(api, chain))/1e10
      }
    }
  },
  heiko: {
    tvl: async () => {
      const chain = 'heiko'
      const api = await getAPI(chain)

      return {
        kusama: (await getStakedAmount(api, chain))/1e12
      }
    }
  },
};

// Taken from https://parallelfi.gitbook.io/parallel-finance/polkadot-network/developer-docs/staking/integration/api
async function getStakedAmount(api, chain) {

  const derivativeIndexList = api.consts.liquidStaking.derivativeIndexList

  const stakingCurrency = api.consts.liquidStaking.stakingCurrency
  const createAddress = id => encodeAddress(u8aConcat(stringToU8a(`modl${id}`), EMPTY_U8A_32).subarray(0, 32))

  const poolAccount = createAddress('par/lqsk')
  // const paraId = await api.query.parachainInfo.parachainId()
  const balanceRes = await api.query.assets.account(stakingCurrency, poolAccount)
  const poolAccountBalance = +balanceRes.unwrapOrDefault().balance
  const totalReserves = +(await api.query.liquidStaking.totalReserves()).toString()
  let totalBonded = 0
  let totalUnbonding = 0
  let total = 0
  for (const derivativeIndex of derivativeIndexList) {
    // const derivativeAccount = subAccountId(sovereignAccountOf(paraId), derivativeIndex)
    const ledger = await api.query.liquidStaking.stakingLedgers(derivativeIndex)
    totalBonded += +ledger.toJSON().active
    totalUnbonding += ledger.toJSON().total - ledger.toJSON().active
    total += +ledger.toJSON().total
    log(chain, ledger.toJSON().total / 1e10)
  }

  const quantity = total + poolAccountBalance - totalReserves

  log(chain, [total, poolAccountBalance, totalReserves, quantity].map(i => Math.floor(i / 1e10)))
  return quantity
}
