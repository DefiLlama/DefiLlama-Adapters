const { queryCanister, decodeCandid, hashCandidLabel } = require('../helper/chain/icp')

const SWAP_CANISTER = '3xwpq-ziaaa-aaaah-qcn4a-cai'
const CANDID_LABELS_MAP = Object.fromEntries(['token0', 'token1', 'reserve0', 'reserve1'].map(label => [hashCandidLabel(label), label]))

// ICP ledgers have no price feed keyed by canister id, so only tokens with a coingecko listing are counted
const tokens = {
  'ryjl3-tyaaa-aaaaa-aaaba-cai': { decimals: 8, coingeckoId: 'internet-computer' }, // ICP
  'utozz-siaaa-aaaam-qaaxq-cai': { decimals: 8, coingeckoId: 'internet-computer' }, // WICP
  'mxzaz-hqaaa-aaaar-qaada-cai': { decimals: 8, coingeckoId: 'bitcoin' }, // ckBTC
  'ss2fx-dyaaa-aaaar-qacoq-cai': { decimals: 18, coingeckoId: 'ethereum' }, // ckETH
  'xevnm-gaaaa-aaaar-qafnq-cai': { decimals: 6, coingeckoId: 'usd-coin' }, // ckUSDC
  '2ouva-viaaa-aaaaq-aaamq-cai': { decimals: 8, coingeckoId: 'openchat' }, // CHAT
  '7pail-xaaaa-aaaas-aabmq-cai': { decimals: 8, coingeckoId: 'bob-3' }, // BOB
  'ca6gz-lqaaa-aaaaq-aacwa-cai': { decimals: 8, coingeckoId: 'icpswap-token' }, // ICS
  'lkwrt-vyaaa-aaaaq-aadhq-cai': { decimals: 8, coingeckoId: 'origyn-foundation' }, // OGY
  'jwcfb-hyaaa-aaaaj-aac4q-cai': { decimals: 8, coingeckoId: 'origyn-foundation' }, // OGY (legacy ledger)
}

async function tvl(api) {
  const [pairs] = decodeCandid(await queryCanister({ canisterId: SWAP_CANISTER, methodName: 'getAllPairs' }), CANDID_LABELS_MAP)
  for (const { token0, token1, reserve0, reserve1 } of pairs) {
    for (const [token, reserve] of [[token0, reserve0], [token1, reserve1]]) {
      const config = tokens[token]
      if (config) api.addCGToken(config.coingeckoId, Number(reserve) / 10 ** config.decimals)
    }
  }
}

module.exports = {
  timetravel: false,
  methodology: 'TVL is the sum of reserves of all pairs in the Sonic swap canister, read on-chain via getAllPairs.',
  icp: { tvl },
}
