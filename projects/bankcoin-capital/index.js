// Bankcoin Capital — fixed-term crypto deposits paid out in G10 kStable tokens
// https://bankcoin.capital / https://cryptodeposit.org
//
// TVL = customer term-deposit principal ONLY, read on-chain as
// depositLiabilities(token) on the deposit Treasury contract for each G10
// kStable. Issuer-owned liquidity (AMM anchor pools, market-making float) and
// issuer interest reserves are deliberately excluded — the protocol never
// counts its own capital as TVL.
//
// kStable tokens have no CoinGecko listing yet (submission in progress), so
// each balance is valued via a same-peg proxy stablecoin (hence
// misrepresentedTokens). Currencies without a reliably priced same-peg proxy
// (kNZD, kSEK, kNOK) are added under the kStable's own token address and
// price as 0 until the listing lands — we prefer undercounting to guessing.

const ABI = 'function depositLiabilities(address) view returns (uint256)'

// every deployed kStable uses 6 decimals (USDC convention)
const DECIMALS = 1e6

const config = {
  base: {
    treasury: '0xAFba2c657410cd9809A252E1696d20799bB85a51',
    tokens: [
      { symbol: 'kUSD', address: '0x6FB09847417e33A1CE75d3B324015D4C0AeF4D61', cgToken: 'usd-coin' },
      { symbol: 'kEUR', address: '0xf9dC39A53F58c6F3e2bcfD44eBbb1585Ced0175e', cgToken: 'euro-coin' },
      { symbol: 'kJPY', address: '0xA65CC044383BE92522C9Ce0287838ADd3c999cDb', cgToken: 'jpy-coin' },
      { symbol: 'kGBP', address: '0x372117419A8c0F59A79d7fFd8F4A5C6a2b347EDa', cgToken: 'monerium-gbp-emoney' },
      { symbol: 'kCHF', address: '0xB64249DA945C3e81f0708069c31B0C0F36D4D806', cgToken: 'vnx-swiss-franc' },
      { symbol: 'kCAD', address: '0xB54B1edc7622f6f7E2a3549E019eCdf5B1941DB4', cgToken: 'cad-coin' },
      { symbol: 'kAUD', address: '0xeaF04dF1b08A6a72369553f886f2CcfA0205eF4B', cgToken: 'novatti-australian-digital-dollar' },
      { symbol: 'kNZD', address: '0x8E25F1EF537AEF95745468F9174587B764452e9C', cgToken: null },
      { symbol: 'kSEK', address: '0x436Cca680EFC191E2cb524743B2258b935A326f8', cgToken: null },
      { symbol: 'kNOK', address: '0x17067A34972699C38cef0ab6Fad6a40299A01FB5', cgToken: null },
    ],
  },
  arbitrum: {
    treasury: '0x8f60538ea82db38892f939bafe9fd8a46b4f5eb5',
    tokens: [
      { symbol: 'kUSD', address: '0x4653092872bE819CdFf244db8a474BBaeAA2B024', cgToken: 'usd-coin' },
      { symbol: 'kEUR', address: '0x4f2039Ae7973c5e5236DB3E0A1E892288894c998', cgToken: 'euro-coin' },
      { symbol: 'kJPY', address: '0x0E8cC7bb79518D355264688D8Cce2895127BeB06', cgToken: 'jpy-coin' },
      { symbol: 'kGBP', address: '0xca4FEB7B88C6A9f3bF10fF0176B05178FCa58E61', cgToken: 'monerium-gbp-emoney' },
      { symbol: 'kCHF', address: '0x8E25F1EF537AEF95745468F9174587B764452e9C', cgToken: 'vnx-swiss-franc' },
      { symbol: 'kCAD', address: '0x5f7cDa7328E114690a1836Cc39B659604C955D0d', cgToken: 'cad-coin' },
      { symbol: 'kAUD', address: '0x713E7aF0c03a6C75267E3C52c8a8bFE496C80daC', cgToken: 'novatti-australian-digital-dollar' },
      { symbol: 'kNZD', address: '0x4D6dbEA3Fb4eC468e52812F7992b39d8d6Cb4415', cgToken: null },
      { symbol: 'kSEK', address: '0x570cdF023703aBdb0e0a96b07F997dfBcBc3F002', cgToken: null },
      { symbol: 'kNOK', address: '0xC0522C96b469F85a743fD9fafb97F0e6993CB6f4', cgToken: null },
    ],
  },
}

async function tvl(api) {
  const { treasury, tokens } = config[api.chain]
  const balances = await api.multiCall({ abi: ABI, target: treasury, calls: tokens.map(t => t.address) })
  tokens.forEach((t, i) => {
    if (t.cgToken) api.addCGToken(t.cgToken, balances[i] / DECIMALS)
    else api.add(t.address, balances[i])
  })
}

module.exports = {
  methodology: 'TVL counts customer term-deposit principal recorded as depositLiabilities(token) on the Bankcoin Capital / CryptoDeposit deposit Treasury contracts on Base and Arbitrum, one entry per G10 kStable token. Issuer-owned liquidity (AMM anchor pools, market-making float) and issuer interest reserves are explicitly excluded — the protocol never counts its own capital as TVL. Until the kStable CoinGecko listing is live, balances are valued via same-peg proxy stablecoins (kUSD via USDC, kEUR via EURC, etc.); currencies without a priced proxy count as 0.',
  misrepresentedTokens: true,
  timetravel: true,
  start: '2026-04-09', // Base deposit Treasury deployment
  base: { tvl },
  arbitrum: { tvl },
}
