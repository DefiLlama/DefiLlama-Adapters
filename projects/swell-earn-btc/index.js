const { sumTokens2, PANCAKE_NFT_ADDRESS } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

const earnBTCVault = '0x66E47E6957B85Cf62564610B76dD206BB04d831a';

const ethTokens = [
  ADDRESSES.ethereum.WBTC, // WBTC
  '0x8DB2350D78aBc13f5673A411D4700BCF87864dDE', // swBTC
  '0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf', // cbBTC
  '0xC96dE26018A54D51c097160568752c4E3BD6C364', // fBTC
  '0xF469fBD2abcd6B9de8E169d128226C0Fc90a012e', // pumpBTC
  '0x8dAEBADE922dF735c38C80C7eBD708Af50815fAa', // tBTC
  '0x8236a87084f8B84306f72007F36F2618A5634494', // LBTC
  '0x7A56E1C57C7475CCf742a1832B028F0456652F97', // solvBTC
]


const tokens = [
  ...ethTokens,
]


const tvl = async (api) => {
  return sumTokens2({
    api,
    owner: earnBTCVault, tokens,
  })
}

module.exports = {
  methodology: 'TVL represents the sum of tokens deposited in the vault on Ethereum and Swellchain',
  doublecounted: true,
  ethereum: { tvl }
}