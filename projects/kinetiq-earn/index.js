const ADDRESSES = require('../helper/coreAssets.json')
const kHype = '0xfd739d4e423301ce9385c1fb8850539d657c296d'
const kHypeEarn = '0x9BA2EDc44E0A4632EB4723E81d4142353e1bB160'
const WHYPE = ADDRESSES.hyperliquid.WHYPE
const accountant = '0x74392Fa56405081d5C7D93882856c245387Cece2'

const tvl = async (api) => {
  const [supply, getRate, balance] = await Promise.all([
    api.call({ target: kHypeEarn, abi: 'erc20:totalSupply' }),
    api.call({ target: accountant, abi: 'uint256:getRate' }),
    api.call({ target: kHype, abi: 'erc20:balanceOf', params: [kHypeEarn] }),
  ])

  const kHypeBalance = getRate / 1e18 * balance
  const whypeBalance = +supply - kHypeBalance

  api.add(WHYPE, whypeBalance)
  api.add(kHype, kHypeBalance)
}

module.exports = {
  doublecounted: true,
  hyperliquid: { tvl }
}