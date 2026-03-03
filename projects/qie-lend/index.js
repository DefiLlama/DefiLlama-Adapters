const sdk = require('@defillama/sdk')
const abis = require('./abis.json')
const BigNumber = require('bignumber.js')

const CHAIN = "qie"
const COMPTROLLER = "0x69a31E3D361C69B37463aa67Ef93067dC760fBD4"

// zero address for native token markets
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"

async function tvl(timestamp, block, chainBlocks) {
  const balances = {}
  const qieBlock = chainBlocks?.[CHAIN]

  // 1️⃣ Get all cToken markets
  const { output: ctokens } = await sdk.api.abi.call({
    target: COMPTROLLER,
    abi: abis.getAllMarkets,
    chain: CHAIN,
    block: qieBlock
  })

  // 2️⃣ Fetch underlying tokens
  const underlyingRes = await sdk.api.abi.multiCall({
    abi: abis.underlying,
    calls: ctokens.map(i => ({ target: i })),
    chain: CHAIN,
    block: qieBlock,
  })

  // 3️⃣ Fetch available liquidity
  const cashRes = await sdk.api.abi.multiCall({
    abi: abis.getCash,
    calls: ctokens.map(i => ({ target: i })),
    chain: CHAIN,
    block: qieBlock,
  })

  // 4️⃣ Fetch total borrowed
  const borrowRes = await sdk.api.abi.multiCall({
    abi: abis.totalBorrows,
    calls: ctokens.map(i => ({ target: i })),
    chain: CHAIN,
    block: qieBlock,
  })

  for (let i = 0; i < ctokens.length; i++) {

    // Handle underlying (native market safe fallback)
    let underlying
    if (underlyingRes.output[i]?.success) {
      underlying = underlyingRes.output[i].output
    } else {
      underlying = ZERO_ADDRESS
    }

    // Safely convert values to full integer strings
    const cash = new BigNumber(cashRes.output[i].output).toFixed(0)
    const borrows = new BigNumber(borrowRes.output[i].output).toFixed(0)

    // Compound V2 TVL formula:
    // TVL = cash + totalBorrows
    const total = new BigNumber(cash)
      .plus(borrows)
      .toFixed(0)

    const key = `${CHAIN}:${underlying}`

    if (!balances[key]) balances[key] = "0"

    balances[key] = new BigNumber(balances[key])
      .plus(total)
      .toFixed(0)
  }

  return balances
}

module.exports = {
  qie: {
    tvl,
  },
  methodology:
    "TVL = total supplied assets in QIE Lend (Compound V2 fork), calculated as getCash() + totalBorrows() across all markets."
}