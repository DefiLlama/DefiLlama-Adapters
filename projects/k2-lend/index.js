const { callSoroban } = require('../helper/chain/stellar')
const { lendingMarket } = require('../helper/methodologies')

const ROUTER = 'CCTUJZLYFAW7ZNQD2SXMUZIHBUUJJICYRKWLZJ6SK6TGNAWNXOJIV6J7'
const RAY = 10n ** 27n

// underlying token -> { aToken, debtToken } — from K2 mainnet deployment manifest
const RESERVES = {
  // PYUSD
  CCCRWH6Q3FNP3I2I57BDLM5AFAT7O6OF6GKQOC6SSJNDAVRZ57SPHGU2: { aToken: 'CA7ELGRS4FNCYJPRZSNLF7NDD6VVOFZKFKMY56VVSG3RMNYTFQNNFUTD', debtToken: 'CAVFE34MWBIXT4AOFXPTI7U7JTLPHKG4YWDDMRXVJOIZKG6HFJW3IHXV' },
  // SolvBTC
  CBIJBDNZNF4X35BJ4FFZWCDBSCKOP5NB4PLG4SNENRMLAPYG4P5FM6VN: { aToken: 'CDDTJ7OZU2WZAEZNTUZWIRAE4EMP5CF63M3INFQWTLX4ENMYUFK6RCTX', debtToken: 'CADGKVZKBNLPKFIWDWTRSQAPBWH77H2OPJIF3WGVL7VADVLCXDZ5CSNH' },
  // USDC
  CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75: { aToken: 'CDHRPTO3NLGQ2CV75LFV6NF6ZMXIPGPID5GTAZTEICBYLMLKJICOMFZK', debtToken: 'CBN4GDHRJN7AIARTSTUD3OK7IOCU5V6HTSOTVARFUA5KVE7XSNBZUQG6' },
  // XLM
  CAS3J7GYLGXMF6TDJBBYYSE3HQ6BBSMLNUQ34T6TZMYMW2EVH34XOWMA: { aToken: 'CDTHJR27QWKAPCFTZWKP7GTX3RZO7HACVAC2KLCW2RENCMOCI35ORU5K', debtToken: 'CC3OKG4VDLGFBS7V6UTSJVP3YL3A4OLV63EMTNUU3MQ2AOAU4M65H7QG' },
}

async function tvl(api) {
  for (const [underlying, { aToken }] of Object.entries(RESERVES)) {
    const bal = await callSoroban(underlying, 'balance', [aToken])
    api.add(underlying, bal.toString())
  }
}

async function borrowed(api) {
  for (const [underlying, { debtToken }] of Object.entries(RESERVES)) {
    // NOTE: debtToken.total_supply() re-enters the router and traps in simulation;
    // scale the stored supply by the current index instead.
    const scaled = await callSoroban(debtToken, 'scaled_total_supply')
    const idx = await callSoroban(ROUTER, 'get_current_var_borrow_idx', [underlying])
    api.add(underlying, ((BigInt(scaled) * BigInt(idx)) / RAY).toString())
  }
}

module.exports = {
  timetravel: false,
  methodology: `${lendingMarket}. TVL sums the underlying token balances held by each K2 reserve's aToken contract; borrowed sums outstanding variable debt (scaled debt supply times the current borrow index).`,
  stellar: { tvl, borrowed },
}
