const ADDRESSES = require('../helper/coreAssets.json')

const { compoundExports } = require('../helper/compound')

const addresses = {
  CantoNoteLP: '0x1D20635535307208919f0b67c3B2065965A85aA9',
  CantoAtomLP: '0x30838619C55B787BafC3A4cD9aEa851C1cfB7b19',
  NoteUSDTLP: '0x35DB1f3a6A6F07f82C76fCC415dB6cFB1a7df833',
  NoteUSDCLP: '0x9571997a66D63958e1B3De9647C22bD6b9e7228c',
  CantoETHLP: '0x216400ba362d8FCE640085755e47075109718C8B',
  Comptroller: '0x5E23dC409Fc2F832f83CEc191E245A191a4bCc5C',
  Note: ADDRESSES.canto.NOTE,
  USDC: ADDRESSES.functionx.WFX,
  USDT: ADDRESSES.functionx.PUNDIX,
  ATOM: ADDRESSES.functionx.USDT,
  ETH: ADDRESSES.functionx.PURSE,
  WCANTO: ADDRESSES.canto.WCANTO,
  CCANTO: '0xb65ec550ff356eca6150f733ba9b954b2e0ca488',
  NOTE_WCANTO: '0x1d20635535307208919f0b67c3b2065965a85aa9',
  ETH_WCANTO: '0x216400ba362d8fce640085755e47075109718c8b',
  WCANT_ATOM: '0x30838619c55b787bafc3a4cd9aea851c1cfb7b19',
  NOTE_USDC: '0x9571997a66d63958e1b3de9647c22bd6b9e7228c',
  NOTE_USDT: '0x35db1f3a6a6f07f82c76fcc415db6cfb1a7df833',
  // PriceFeed: '0xa252eEE9BDe830Ca4793F054B506587027825a8e'
}

const chain = 'canto'
const compoundData = compoundExports(addresses.Comptroller, addresses.CCANTO, addresses.WCANTO, { blacklistedTokens:[ 
  addresses.Note,
  addresses.NOTE_WCANTO,
  addresses.ETH_WCANTO,
  addresses.WCANT_ATOM,
  addresses.NOTE_USDC,
  addresses.NOTE_USDT,
 ] })

module.exports = {
  hallmarks: [
    [1661417246, "Remove canto dex LPs from tvl computation"]
  ],
  canto: compoundData
}
