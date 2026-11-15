const ADDRESSES = require('../helper/coreAssets.json')
const { getProvider } = require('../helper/solana')
const { getLogs2 } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')
const { PublicKey } = require('@solana/web3.js')

const CURVE_PROGRAM = 'EscapeCu75SSPg24kyh7R6NvwgMUT8QEpCLY6kKHYCeD'
const BONDING_CURVE_SIZE = 120
const BONDING_CURVE_DISCRIMINATOR = '4y6pru6YvC7' // 17b7f83760d8ac60
const OFFSET_SOL_RESERVE = 72 // u64
const OFFSET_IS_GRADUATED = 104 // bool
const NOT_GRADUATED = '1' // 0x00

async function solanaTvl(api) {
  const connection = getProvider().connection
  const curves = await connection.getProgramAccounts(new PublicKey(CURVE_PROGRAM), {
    filters: [
      { dataSize: BONDING_CURVE_SIZE },
      { memcmp: { offset: 0, bytes: BONDING_CURVE_DISCRIMINATOR } },
      { memcmp: { offset: OFFSET_IS_GRADUATED, bytes: NOT_GRADUATED } },
    ],
  })
  for (const { account } of curves) {
    const data = account.data
    if (data[OFFSET_IS_GRADUATED] !== 0) continue
    api.add(ADDRESSES.solana.SOL, data.readBigUInt64LE(OFFSET_SOL_RESERVE).toString())
  }
}

const TOKEN_CREATED = 'event TokenCreated(address indexed token, address indexed market, address indexed creator, string name, string symbol, string metadataURI, uint256 virtualNativeOffset)'

const EVM_FACTORIES = {
  base: { factory: '0x99Feb0E3d5Ba40eB5DF8D914f5A06370CaE5CA6E', fromBlock: 57899403 },
  robinhood: { factory: '0x99Feb0E3d5Ba40eB5DF8D914f5A06370CaE5CA6E', fromBlock: 115197467 },
}

function evmTvl({ factory, fromBlock }) {
  return async (api) => {
    const logs = await getLogs2({ api, target: factory, eventAbi: TOKEN_CREATED, fromBlock })
    const markets = logs.map((log) => log.market)
    return sumTokens2({ api, owners: markets, tokens: [ADDRESSES.null] })
  }
}

module.exports = {
  timetravel: false,
  methodology: 'Counts SOL and ETH in bonding curves that have not graduated yet. Solana: sol_reserve of every non-graduated BondingCurve account. Base and Robinhood: ETH balance of every market created by the TokenFactory. Graduated liquidity and launched tokens are not counted.',
  solana: { tvl: solanaTvl },
}

Object.entries(EVM_FACTORIES).forEach(([chain, config]) => {
  module.exports[chain] = { tvl: evmTvl(config) }
})
