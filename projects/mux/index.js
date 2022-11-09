const BigNumber = require("bignumber.js");
const abi = require("./abi.json");
const sdk = require("@defillama/sdk");
const { Contract, providers } = require("ethers");
const { getChainTransform, getFixBalances } = require("../helper/portedTokens");

const liquidityPoolContract = {
  arbitrum: '0x3e0199792Ce69DC29A0a36146bFa68bd7C8D6633',
  bsc: '0x855E99F768FaD76DD0d3EB7c446C0b759C96D520',
  avax: '0x0bA2e492e8427fAd51692EE8958eBf936bEE1d84',
  fantom: '0x2e81F443A11a943196c88afcB5A0D807721A88E6',
}

const readerContract = {
  arbitrum: '0x6e29c4e8095B2885B8d30b17790924F33EcD7b33',
  bsc: '0xeAb5b06a1ea173674601dD54C612542b563beca1',
  avax: '0x5996D4545EE59D96cb1FE8661a028Bef0f4744B0',
  fantom: '0x29F4dC996a0219838AfeCF868362E4df28A70a7b',
}

const chainId = {
  arbitrum: 42161,
  bsc: 56,
  avax: 43114,
  fantom: 250,
}

const rpc = {
  arbitrum: process.env.ARBITRUM_RPC || 'https://arb1.arbitrum.io/rpc',
  bsc: process.env.BSC_RPC || 'https://bsc-dataseed4.binance.org',
  avax: process.env.AVAX_RPC || 'https://api.avax.network/ext/bc/C/rpc',
  fantom: process.env.FANTOM_RPC || 'https://fantom-mainnet.gateway.pokt.network/v1/lb/62759259ea1b320039c9e7ac',
}

const invalidAddress = '0x0000000000000000000000000000000000000000'

async function tvl(chain, block) {
  const transformAddress = await getChainTransform(chain)
  const provider = new providers.JsonRpcProvider(rpc[chain], chainId[chain])
  const contract = new Contract(readerContract[chain], abi, provider)
  const storage = await contract.callStatic.getChainStorage()
  const assets = storage[1]
  const dexs = storage[2]

  const tokens = assets.filter(token => token.tokenAddress !== invalidAddress).map(token => {
    return {address: token.tokenAddress, key: transformAddress(token.tokenAddress), decimals: token.decimals, assetId: token.id}
  })

  const owner = liquidityPoolContract[chain]
  const balances = {}
  const balanceOfTokens = await sdk.api.abi.multiCall({
    calls: tokens.map(t => ({
      target: t.address,
      params: owner
    })),
    abi: 'erc20:balanceOf',
    block,
    chain
  })

  balanceOfTokens.output.forEach((result, idx) => {
    const token = tokens[idx]
    const balance = BigNumber(result.output)
    try {
      balances[token.key] = BigNumber(balances[token.key] || 0).plus(balance).toFixed(0)
    } catch (e) {
      console.log(token, balance, balances[token])
      throw e
    }
  })

  dexs.forEach(dex => {
    dex.liquidityBalance.forEach((balance, index) => {
      const assetId = dex.assetIds[index]
      const token = tokens.find(t => assetId === t.assetId)
      balances[token.key] = BigNumber(balances[token.key] || 0).plus(balance.toString()).toFixed(0)
    })
  })

  Object.entries(balances).forEach(([token, value]) => {
    if (+value === 0) delete balances[token]
  })

  const fixBalances = await getFixBalances(chain)
  const fixedBalances = fixBalances(balances)
  return fixedBalances
}

module.exports = {
  methodology: `This is the total value of all tokens in the MUXLP Pool. The liquidity pool consists of a token portfolio used for margin trading and third-party DEX mining.`,
}

Object.keys(chainId).forEach(chain => {
  module.exports[chain] = {
    tvl: async (_, _b, {[chain]: block}) => {
      return tvl(chain, block)
    }
  }
})