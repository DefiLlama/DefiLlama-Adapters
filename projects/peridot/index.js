const ADDRESSES = require('../helper/coreAssets.json')
const { compoundExports2 } = require('../helper/compound')
const { callSoroban } = require('../helper/chain/stellar')

// Peridot on Stellar is a Soroban deployment (not a Compound fork port): each market is a
// ReceiptVault contract that custodies the underlying SAC and tracks its own debt ledger.
// https://github.com/PeridotFinance/Peridot-Soroban/blob/main/peridot-contracts/contracts/receipt-vault/src/lib.rs
const stellarMarkets = [
  { vault: 'CBU4Y7CJFOUZZE3QBOXTKM54UTUYW3SDJWTNMDGJBNCR5HS5UCEKV3BE', underlying: ADDRESSES.stellar.XLM },
  { vault: 'CBVUJJIJTRJNOORPPCVH72DP7YDCOMDHI6WYKP3WOFVEPSCVP3TBXHIN', underlying: ADDRESSES.stellar.USDC },
  { vault: 'CD3WN3PLW63HFZXE56OTRLMBV46WG54TFPGRL4RDQ43HQTTWVB4RPO3G', underlying: ADDRESSES.stellar.EURC },
]

// Underlying sitting in the vault, i.e. the Soroban equivalent of Compound's getCash().
async function stellarTvl(api) {
  await Promise.all(stellarMarkets.map(async ({ vault, underlying }) => {
    const cash = await callSoroban(underlying, 'balance', [vault])
    api.add(underlying, cash.toString())
  }))
}

async function stellarBorrowed(api) {
  await Promise.all(stellarMarkets.map(async ({ vault, underlying }) => {
    const borrowed = await callSoroban(vault, 'get_total_borrowed')
    api.add(underlying, borrowed.toString())
  }))
}

module.exports = {
  methodology: 'TVL is the underlying held by the protocol: on BSC and Monad the cash of every Peridot market listed on the comptroller, on Stellar the underlying balance custodied by each Soroban ReceiptVault. Outstanding debt is reported separately as borrowed.',
  bsc: compoundExports2({ comptroller: '0x6fC0c15531CB5901ac72aB3CFCd9dF6E99552e14' }),
  monad: compoundExports2({ comptroller: '0x6D208789f0a978aF789A3C8Ba515749598940716', blacklistedMarkets: ['0xf8255935e62aa000c89de46a97d2f00bfff147e7'], cether: '0x2FB2861402A22244464435773dd1C6951735CdF7' }),
  stellar: { tvl: stellarTvl, borrowed: stellarBorrowed },
}
