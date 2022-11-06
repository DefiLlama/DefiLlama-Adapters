
const { compoundExports } = require('../helper/compound')
const { unwrapLPsAuto } = require('../helper/unwrapLPs')
const { getTokenPrices } = require('../helper/unknownTokens')
const { getFixBalances } = require('../helper/portedTokens')

const addresses = {
  CantoNoteLP: '0x1D20635535307208919f0b67c3B2065965A85aA9',
  CantoAtomLP: '0x30838619C55B787BafC3A4cD9aEa851C1cfB7b19',
  NoteUSDTLP: '0x35DB1f3a6A6F07f82C76fCC415dB6cFB1a7df833',
  NoteUSDCLP: '0x9571997a66D63958e1B3De9647C22bD6b9e7228c',
  CantoETHLP: '0x216400ba362d8FCE640085755e47075109718C8B',
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

const chain = 'canto'
const checkForLPTokens = i => /vAMM/.test(i)
const compoundData = compoundExports(addresses.Comptroller, chain, addresses.CCANTO, addresses.WCANTO, undefined, checkForLPTokens, { blacklistedTokens:[ addresses.Note ] })

module.exports = {
  hallmarks: [
    [1661417246, "Remove canto dex LPs from tvl computation"]
  ],
  misrepresentedTokens: true,
  canto: {
    tvl, borrowed,
  }
}

async function update(block, balances) {
  const lps = Object.keys(addresses).filter(i => /LP$/.test(i)).map(i => addresses[i])
  lps.push(...Object.keys(balances))
  const { updateBalances, } = await getTokenPrices({ chain, block, lps, useDefaultCoreAssets: true,  })
  updateBalances(balances)
  return balances
}

async function tvl(_, _b, cb) {
  const block = cb[chain]
  const balances = await compoundData.tvl(_, _b, cb)
  // await unwrapLPsAuto({ balances, chain, block, })
  // await update(block, balances)
  const fixBalances = await getFixBalances(chain)
  fixBalances(balances)
  return balances
}

async function borrowed(_, _b, cb) {
  const block = cb[chain]
  const balances = await compoundData.borrowed(_, _b, cb)
  // await unwrapLPsAuto({ balances, chain, block, })
  // await update(block, balances)
  const fixBalances = await getFixBalances(chain)
  fixBalances(balances)
  return balances
}
