const { callSoroban } = require('../helper/chain/stellar')

const AGVT_TOKEN = 'CDQDXYC42G4ODKZA7B3RARH6VEOGCCQAX2UXOZLDYBNGDEOWODTSQYAZ'
const EXCHANGE = 'CATKU4CKIUVPTNTLBHUFWIE5NOXO6CUW7EZGJLNAOZBKTQGXFHFIRN5N'
const USDC = 'CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75'

/**
 * Calculates TVL by fetching the total AGVT token supply and exchange rate from on-chain contracts,
 * then converting to the equivalent USDC value using the contract's redeem formula.
 */
async function tvl(api) {
  const [totalSupply, rate] = await Promise.all([
    callSoroban(AGVT_TOKEN, 'total_supply'),
    callSoroban(EXCHANGE, 'get_rate'),
  ])

  // Redeem formula from contract: usdc_amount = agvt_amount * 10_000_000 / exchange_rate
  // totalSupply is in raw AGVT units (7 decimals), rate uses 7-decimal scaling
  // Result is raw USDC units (6 decimals)
  const rateBn = BigInt(rate)
  if (rateBn === 0n) {
    api.add(USDC, '0')
    return
  }

  const usdcValue = BigInt(totalSupply) * 10_000_000n / rateBn

  api.add(USDC, usdcValue.toString())
}

module.exports = {
  methodology: 'TVL is calculated by converting the total AGVT vault token supply to USDC using the exchange contract redeem formula (supply * scale / rate), representing the total USDC value backing all vault tokens.',
  timetravel: false,
  stellar: { tvl },
}
