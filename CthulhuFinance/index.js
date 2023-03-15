const sdk = require('@defillama/sdk')
const abi = require('./abi')
const { getChainTransform } = require('../helper/portedTokens')
const chain = 'optimism'

const vaults = [
  "0xFca7B025449373fdDE24acCA662304b36cFd26a8",
  "0xF6a6C4573099E6F6b9D8E1186a2C089B4d0fDf91",
  "0x8296E2C3a78EdfEf9847F7Bcb6Cf57e09fDA5B83",
  "0xabd80105bb547904e5B33A41e84FFFCF1623f5A9",
  "0xeb2e04225D9a570eBd1C9577FfAF401ee076b7FD",
  "0xD61eE9E1991A22660FF10161926FF24B98Ad7918",

]
const lps = [
  "0xF8e943f646816e4B51279B8934753821ED832Dca",
  "0x7F5c764cBc14f9669B88837ca1490cCa17c31607",
  "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58",
  "0x4200000000000000000000000000000000000042",
  "0x4200000000000000000000000000000000000006",
  "0xB220503db292a4d01FDb1725b95c0BDd734A6Ce3",
]


async function tvl(_, _b, {[chain]: block }) {
  const balances = {}
  const transformAddress = await getChainTransform(chain)

  const { output: tokens } = await sdk.api.abi.multiCall({
    abi: abi.balance,
    calls: vaults.map(i => ({ target: i})),
    chain, block,
  })

  tokens.forEach((data, i) => {
    sdk.util.sumSingleBalance(balances, transformAddress(lps[i]), data.output)
  })

  return balances

}

module.exports = {
  optimism: { 
    tvl,
  }
}

