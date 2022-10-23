const sdk = require('@defillama/sdk')
const { unwrapUniswapLPs } = require("../helper/unwrapLPs")
const { transformBalances, } = require('../helper/portedTokens')

const clpAddresses = {
  CantoNoteLP: '0x3C96dCfd875253A37acB3D2B102b6f328349b16B',
  CantoAtomLP: '0xC0D6574b2fe71eED8Cd305df0DA2323237322557',
  NoteUSDTLP: '0xf0cd6b5cE8A01D1B81F1d8B76643866c5816b49F',
  NoteUSDCLP: '0xD6a97e43FC885A83E97d599796458A331E580800',
  CantoETHLP: '0xb49A395B39A0b410675406bEE7bD06330CB503E3',
}
const vaultAddresses = {
  CantoNoteLP: '0xe9F857be65E73c0bc86BCbb35cA8aFAB4d70e178',
  CantoAtomLP: '0x698880B18B237BD042440BCB23e0134a38d3295b',
  NoteUSDTLP: '0x72987Fa687496F3797d944BFCfddAdBe306581AE',
  NoteUSDCLP: '0x541ebf0a46c3138098bcebe1698dA3FDb6BA8f8A',
  CantoETHLP: '0x3f1CbcF0495928b0f347b50ceCFd8641BBc44A7f',
}

const lps = Object.keys(vaultAddresses)
const chain = 'canto'

async function tvl(_, _b, { canto: block }) {
  const calls = lps.map(k => ({ target: clpAddresses[k], }))
  const calls2 = lps.map(k => ({ params: vaultAddresses[k], target: clpAddresses[k] }))
  const lpPositions = []

  const balances = {}
  const [
    { output: token, },
    { output: balance, },
  ] = await Promise.all([
    sdk.api.abi.multiCall({ abi: abis.underlying, calls, chain, block, }),
    sdk.api.abi.multiCall({ abi: abis.balanceOfUnderlying, calls: calls2, chain, block, }),
  ])

  balance.forEach(({ output, }, i) => lpPositions.push({ token: token[i].output, balance: output, }))

  await unwrapUniswapLPs(balances, lpPositions, block, chain)
  return transformBalances(chain, balances)
}

module.exports = {
  misrepresentedTokens: true,
  canto: {
    tvl,
  },
};

const abis = {
  balanceOfUnderlying: { "type": "function", "stateMutability": "nonpayable", "outputs": [{ "type": "uint256", "name": "", "internalType": "uint256" }], "name": "balanceOfUnderlying", "inputs": [{ "type": "address", "name": "owner", "internalType": "address" }] },
  underlying: { "type": "function", "stateMutability": "view", "outputs": [{ "type": "address", "name": "", "internalType": "address" }], "name": "underlying", "inputs": [] },
}