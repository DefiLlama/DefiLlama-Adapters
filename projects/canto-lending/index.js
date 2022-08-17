
const { compoundExports } = require('../helper/compound')
const { unwrapLPsAuto } = require('../helper/unwrapLPs')
const { getTokenPrices } = require('../helper/unknownTokens')

const addresses = {
  CantoNoteLP: '0x1D20635535307208919f0b67c3B2065965A85aA9',
  cCantoNoteLP: '0x3C96dCfd875253A37acB3D2B102b6f328349b16B',
  CantoAtomLP: '0x30838619C55B787BafC3A4cD9aEa851C1cfB7b19',
  cCantoAtomLP: '0xC0D6574b2fe71eED8Cd305df0DA2323237322557',
  NoteUSDTLP: '0x35DB1f3a6A6F07f82C76fCC415dB6cFB1a7df833',
  cNoteUSDCLP: '0xD6a97e43FC885A83E97d599796458A331E580800',
  NoteUSDCLP: '0x9571997a66D63958e1B3De9647C22bD6b9e7228c',
  cNoteUSDTLP: '0xf0cd6b5cE8A01D1B81F1d8B76643866c5816b49F',
  CantoETHLP: '0x216400ba362d8FCE640085755e47075109718C8B',
  cCantoETHLP: '0xb49A395B39A0b410675406bEE7bD06330CB503E3',
  Comptroller: '0x5E23dC409Fc2F832f83CEc191E245A191a4bCc5C',
  Note: '0x4e71A2E537B7f9D9413D3991D37958c0b5e1e503',
  USDC: '0x80b5a32E4F032B2a058b4F29EC95EEfEEB87aDcd',
  USDT: '0xd567B3d7B8FE3C79a1AD8dA978812cfC4Fa05e75',
  ATOM: '0xecEEEfCEE421D8062EF8d6b4D814efe4dc898265',
  ETH: '0x5FD55A1B9FC24967C4dB09C513C3BA0DFa7FF687',
  WCANTO: '0x826551890Dc65655a0Aceca109aB11AbDbD7a07B',
  CCANTO: '0xb65ec550ff356eca6150f733ba9b954b2e0ca488',
  // PriceFeed: '0xa252eEE9BDe830Ca4793F054B506587027825a8e'
}
const coreAssets = [
  addresses.USDT,
  addresses.USDC,
  addresses.ETH,
]

const chain = 'canto'
const compoundData = compoundExports(addresses.Comptroller, chain, addresses.CCANTO, addresses.WCANTO)


module.exports = {
  misrepresentedTokens: true,
  canto: {
    tvl, borrowed,
  }
}

async function update(block, balances) {
  const lps = Object.keys(addresses).filter(i => /LP$/.test(i)).map(i => addresses[i])
  lps.push(...Object.keys(balances))
  const { updateBalances, prices } = await getTokenPrices({ chain, block, lps, coreAssets,  })
  updateBalances(balances)
  return balances
}

async function tvl(_, _b, cb) {
  const block = cb[chain]
  const balances = await compoundData.tvl(_, _b, cb)
  await unwrapLPsAuto({ balances, chain, block, })
  return update(block, balances)
}
async function borrowed(_, _b, cb) {
  const block = cb[chain]
  const balances = await compoundData.borrowed(_, _b, cb)
  await unwrapLPsAuto({ balances, chain, block, })
  return update(block, balances)
}
