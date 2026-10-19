const { post } = require('./helper/http')

const RPC = 'https://n3seed1.ngd.network:10332'
const FACTORY = '0xca2d20610d7982ebe0bed124ee7e9b2d580a6efc' // FlamingoSwapFactory (N3)

// pool tokens the coins api can price; bNEO is NeoBurger's 1:1 wrapped NEO
const PRICED = {
  '0xd2a4cff31913016155e38e474a2c06d08be276cf': null, // GAS
  '0x68b938cc42b6a2d54fb9040f5facf4290ebb8c5f': null,
  '0xd3a41b53888a733b549f5d4146e7a98d3285fa21': null,
  '0x4548a3bcb3c2b5ce42bf0559b1cf2f1ec97a51d0': null,
  '0x48c40d4666f93408be1bef038b6722404d9a4c2a': { cg: 'neo', decimals: 8 }, // bNEO
}

// script hashes come back base64 encoded, little endian
const toHash = b64 => '0x' + Buffer.from(b64, 'base64').reverse().toString('hex')

async function invoke(contract, method) {
  const { result } = await post(RPC, { jsonrpc: '2.0', id: 1, method: 'invokefunction', params: [contract, method, []] })
  if (result.state !== 'HALT') throw new Error(`${contract}.${method} failed: ${result.exception}`)
  return result.stack[0]
}

function add(api, token, amount) {
  const mapped = PRICED[token]
  if (mapped) api.addCGToken(mapped.cg, Number(amount) / 10 ** mapped.decimals)
  else api.add(token, amount)
}

async function tvl(api) {
  const pairs = (await invoke(FACTORY, 'getAllExchangePair')).value.map(s => s.value.map(v => toHash(v.value)))
  for (const [token0, token1, pair] of pairs) {
    const [r0, r1] = (await invoke(pair, 'getReserves')).value.map(v => BigInt(v.value))
    const p0 = token0 in PRICED, p1 = token1 in PRICED
    // a side without a price is valued as equal to the priced side
    if (p0) add(api, token0, p1 ? r0 : r0 * 2n)
    if (p1) add(api, token1, p0 ? r1 : r1 * 2n)
  }
}

module.exports = {
  hallmarks: [
    ['2021-12-03', "N3 migration start"],
    ['2022-01-02', "100% minting on N3"],
    ['2022-01-10', "First IDO"],
    ['2024-09-23', "Wave 3 of new liquidity pools"],
  ],
  methodology: 'Reserves of every Flamingo swap pair, read on-chain from the FlamingoSwapFactory on Neo N3. Pairs with one unpriced token are valued at twice the priced side; pairs with no priced token are excluded.',
  misrepresentedTokens: true,
  timetravel: false,
  neo: { tvl },
}
