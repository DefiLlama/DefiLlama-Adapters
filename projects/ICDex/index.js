const { icp } = require('@defillama/sdk').chains

// ICDexRouter: lists every trading pair canister; each pair holds its traders' deposits of both tokens
const ROUTER = 'i2ied-uqaaa-aaaar-qaaza-cai'
const LABELS = ['data', 'total', 'pair', 'token0', 'token1', 'dexName', 'canisterId', 'icrc1', 'icrc2', 'dip20', 'drc20', 'icp', 'ledger', 'other']
const ICRC_STANDARDS = new Set(['icrc1', 'icrc2', 'icp']) // the ICP ledger also implements icrc1_balance_of

// token ledger canister -> coingecko id (decimals are read from the ledger)
const tokens = {
  'ryjl3-tyaaa-aaaaa-aaaba-cai': 'internet-computer', // ICP
  'mxzaz-hqaaa-aaaar-qaada-cai': 'bitcoin', // ckBTC
  'ss2fx-dyaaa-aaaar-qacoq-cai': 'ethereum', // ckETH
  'xevnm-gaaaa-aaaar-qafnq-cai': 'usd-coin', // ckUSDC
  'cngnf-vqaaa-aaaar-qag4q-cai': 'tether', // ckUSDT
  'bptq2-faaaa-aaaar-qagxq-cai': 'wrapped-bitcoin', // ckWBTC
  'g4tto-rqaaa-aaaar-qageq-cai': 'chainlink', // ckLINK
  'ilzky-ayaaa-aaaar-qahha-cai': 'uniswap', // ckUNI
  'etik7-oiaaa-aaaar-qagia-cai': 'pepe', // ckPEPE
  'fxffn-xiaaa-aaaar-qagoa-cai': 'shiba-inu', // ckSHIB
  '2ouva-viaaa-aaaaq-aaamq-cai': 'openchat', // CHAT
  '7pail-xaaaa-aaaas-aabmq-cai': 'bob-3', // BOB
  'lkwrt-vyaaa-aaaaq-aadhq-cai': 'origyn-foundation', // OGY
  'ca6gz-lqaaa-aaaaq-aacwa-cai': 'icpswap-token', // ICS
  '6c7su-kiaaa-aaaar-qaira-cai': 'gold-token', // GLDT
  'rh2pm-ryaaa-aaaan-qeniq-cai': 'windoge98', // EXE
  'jcmow-hyaaa-aaaaq-aadlq-cai': 'waterneuron', // WTN
}

async function tvl(api) {
  const { data } = await icp.callCandid({
    canisterId: ROUTER, method: 'getPairs', labels: LABELS,
    args: [null, null], argTypes: [{ opt: 'nat' }, { opt: 'nat' }],
  })

  const decimals = {}
  for (const { '0': pairCanister, '1': { pair } } of data) {
    for (const token of [pair.token0, pair.token1]) {
      const ledger = token['0']
      const standard = Object.keys(token['2'])[0]
      if (!tokens[ledger] || !ICRC_STANDARDS.has(standard)) continue
      if (decimals[ledger] === undefined) decimals[ledger] = await icp.getIcrcDecimals({ ledger })
      const balance = await icp.getIcrcBalance({ ledger, owner: pairCanister })
      api.addCGToken(tokens[ledger], Number(balance) / 10 ** decimals[ledger])
    }
  }
}

module.exports = {
  timetravel: false,
  methodology: 'TVL is the balance of each ICDex trading pair canister (listed by the ICDexRouter) in both of its tokens, read from the token ledgers on-chain.',
  icp: { tvl },
}
