const { getProvider, getTokenDecimals } = require('../helper/solana')
const { PublicKey } = require('@solana/web3.js')
const { Program, } = require("@project-serum/anchor");
const idl = require('./idl');

const INTERNAL_DECIMALS = 12;

let tokenData

async function _getTokenData() {
  const mainAccountAddress = new PublicKey('6JVfU8Cp2oAQi39YBpTSuozHiZAUa7j4t1gDyF9RDFEi')
  const programId = new PublicKey('J21zqcffYQU2NUJrvAKhqpKZLQK1YaB9dY5kmcxkMQvQ')
  const provider = getProvider()
  const program = new Program(idl, programId, provider)
  const data = await program.account.mainAccount.fetch(mainAccountAddress)
  data.tokens = data.tokens.slice(0, 6)
  data.balances = data.balances.slice(0, 6)
  data.tokenDecimals = await getTokenDecimals(data.tokens.map(({ mint }) => mint.toBase58()))
  return data
}

async function getTokenData() {
  if (!tokenData) tokenData = _getTokenData()
  return tokenData
}

async function tvl(_, _1, _2, { api }) {
  const data = await getTokenData()
  data.tokens.forEach(({ mint }, i) => {
    const token = mint.toBase58()
    const { balance: { depositTotal, borrowTotal } } = data.balances[i]
    const decimals = 10 ** (data.tokenDecimals[token] - INTERNAL_DECIMALS)
    api.add(token, depositTotal.toString() * decimals)
    api.add(token, borrowTotal.toString() * -1 * decimals)
  })
}

async function borrowed(_, _1, _2, { api }) {
  const data = await getTokenData()
  data.tokens.forEach(({ mint }, i) => {
    const token = mint.toBase58()
    const { balance: { borrowTotal } } = data.balances[i]
    const decimals = 10 ** (data.tokenDecimals[token] - INTERNAL_DECIMALS)
    api.add(token, borrowTotal.toString()* decimals)
  })
}

module.exports = {
  timetravel: false,
  solana: {
    tvl,
    borrowed: () => 0,
  },
}
