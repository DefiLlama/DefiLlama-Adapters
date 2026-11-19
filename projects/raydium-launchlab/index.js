const { PublicKey } = require('@solana/web3.js')
const ADDRESSES = require('../helper/coreAssets.json')
const { getConnection } = require('../helper/solana')

const LAUNCHLAB = new PublicKey('LanMV9sAd7wArD4vJFi2qDdfnVhFxYSUg6eADduJ3uj')
const POOL_STATE_DISCRIMINATOR = 'iUE1qg7KXeV'
const STATUS_OFFSET = 17
const STATUS_TRADING = '1' // base58 of the byte 0: still on the bonding curve, migrated pools are counted under Raydium AMM
const REAL_QUOTE_OFFSET = 61
const QUOTE_MINT_OFFSET = 237

const { SOL, USD1, USDC, USDT } = ADDRESSES.solana

async function tvl(api) {
  const connection = getConnection()
  // one scan per quote token, reading only the 8 bytes of real_quote: there are over a million pools
  for (const quoteMint of [SOL, USD1, USDC, USDT]) {
    const pools = await connection.getProgramAccounts(LAUNCHLAB, {
      filters: [
        { memcmp: { offset: 0, bytes: POOL_STATE_DISCRIMINATOR } },
        { memcmp: { offset: STATUS_OFFSET, bytes: STATUS_TRADING } },
        { memcmp: { offset: QUOTE_MINT_OFFSET, bytes: quoteMint } },
      ],
      dataSlice: { offset: REAL_QUOTE_OFFSET, length: 8 },
    })
    api.add(quoteMint, pools.reduce((sum, { account }) => sum + account.data.readBigUInt64LE(0), 0n).toString())
  }
}

module.exports = {
  timetravel: false,
  isHeavyProtocol: true,
  methodology: 'Counts the SOL, USD1, USDC and USDT bought into LaunchLab bonding curves that have not migrated yet. The launched tokens themselves are not counted.',
  solana: { tvl },
}
