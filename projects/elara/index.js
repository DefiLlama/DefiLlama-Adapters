const ADDRESSES = require('../helper/coreAssets.json')

const TREASURY_WALLETS = [
  '0xFa92ED1ab198759045B5a9a35c3Ac7b63252A047', // depositWallet
  '0x52D0238F31D30334b88c227F72EbDb9d02E094c0', // withdrawWallet
]

const COLLATERAL_TOKENS = [
  ADDRESSES.ethereum.USDC,
  ADDRESSES.ethereum.USDT,
  ADDRESSES.ethereum.USDe,
]

module.exports = {
  start: '2026-06-16',
  methodology: 'TVL counts supported collateral assets (USDC, USDT, and USDe) held in Elara treasury deposit and withdraw wallets on Ethereum.',
  ethereum: {
    tvl: (api) => api.sumTokens({ owners: TREASURY_WALLETS, tokens: COLLATERAL_TOKENS }),
  },
}
