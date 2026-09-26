const { get } = require('../helper/http')

// The account that holds WhaleHub's ICE locks. AQUA deposited by users leaves
// the Soroban contract to this account, which creates the Stellar-classic
// claimable balances that Aquarius reads to grant ICE.
const ICE_LOCKER = 'GDERSSCKJQPPXUQOZIOXGRVAGNLVPVZCJ2MAX7RCMVMWGRPVAEG7XGTK'
const AQUA_CLASSIC = 'AQUA:GBNZILSTVQZ4R7IKQDGHYGY2QXL5QOFJYQMXPKWRRM5PAV7Y4M67AQUA'

// Protocol-owned AQUA locked straight from the locker account on 2026-07-28/29
// (4 x 10M, 1 x 5M and a 10 AQUA test lock, 45,000,010 AQUA in total). None of
// it passed through the staking contract and there is no matching ICE-lock
// authorization, so it is counted as treasury rather than user TVL.
const PROTOCOL_OWNED_BALANCES = new Set([
  '00000000eddc0e5124ffaa6713bee901886cb638151ca1f71148cd03692667726733c490',
  '00000000e2a8c6ea74cd0f4bf17aa7822b03db58487f28025412dccaecb4c14d5aceae4b',
  '0000000012d2feaacec5bdc70d4497a6b97e8430c9c91851dc018edda8f9a1e8172a8a16',
  '000000007eef8af918fe2bcdcca857ef8a827b68bd6ecd946c8e3f9b9a9d1af444ff56a9',
  '000000000b4fc99b0f6c86a1fe9046f31cdfd8a26e0e5f15958a215c33584f80ae45a6bd',
  '0000000083502627a0dfe34ceda2175240fe8fc4dd071ad7c2a53ecfa3c540b42d66e530',
])

// AQUA held in the ICE-lock claimable balances, split into user-origin and
// protocol-owned. Amounts are in whole AQUA.
async function lockedAqua() {
  let url = `https://horizon.stellar.org/claimable_balances?claimant=${ICE_LOCKER}&asset=${AQUA_CLASSIC}&limit=200`
  let user = 0
  let protocol = 0
  const seen = new Set()
  while (url) {
    const res = await get(url)
    const records = res._embedded && res._embedded.records
    if (!records || !records.length) break
    for (const r of records) {
      if (seen.has(r.id)) continue
      seen.add(r.id)
      if (PROTOCOL_OWNED_BALANCES.has(r.id)) protocol += +r.amount
      else user += +r.amount
    }
    if (records.length < 200) break
    url = res._links.next.href
  }
  return { user, protocol }
}

module.exports = { lockedAqua }
