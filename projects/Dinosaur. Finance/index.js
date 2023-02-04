const sdk = require('@defillama/sdk')
const abi = require('./abi')
const { getChainTransform } = require('../helper/portedTokens')
const chain = 'arbitrum'

const vaults = [
  "0xd93567C2634e907c1AA0D91A6d514dFf0491e0dC",
  "0x75b44D326fDfFe3889f9B26d166DF44E938824ce",
  "0x1A53a7C19b29df3e94c0559Ea41BDF5A8e9A88DD",
]
const lps = [
  "0xcb0e5bfa72bbb4d16ab5aa0c60601c438f04b4ad",
  "0x905dfcd5649217c42684f23958568e533c711aa3",
  "0x515e252b2b5c22b4b2b6Df66c2eBeeA871AA4d69"
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
  arbitrum: { 
    tvl,
  }
}

