const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')
const sdk = require("@defillama/sdk");
const { getConfig } = require('../helper/cache')
const { get } = require('../helper/http')
const { sumTokensExport } = require("../helper/sumTokens");
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js');

const tronBridgeContract = 'TXeFBRKUW2x8ZYKPD13RuZDTd9qHbaPGEN';
const EXCLUDED_TRX_ADDRESS = 'T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb'

const getBridgeContract = {
  'ethereum': { address : '0xC707E0854DA2d72c90A7453F8dc224Dd937d7E82' },
  'bsc': { address :'0x75Ab1d50BEDBd32b6113941fcF5359787a4bBEf4' },
  // 'heco': { address :'0x2ead2e7a3bd88c6a90b3d464bc6938ba56f1407f' },
  'okexchain': { address :'0xE096d12D6cb61e11BCE3755f938b9259B386523a' },
  'harmony': { address :'0x32Fae32961474e6D19b7a6346524B8a6a6fd1D9c' },
  'polygon': { address :'0x9DDc2fB726cF243305349587AE2a33dd7c91460e' },
  'kcc': { address :'0xdb442dff8ff9fd10245406da9a32528c30c10c92' },
  'cronos': { address :'0x3758AA66caD9F2606F1F501c9CB31b94b713A6d5' },
  'avax': { address :'0x3758AA66caD9F2606F1F501c9CB31b94b713A6d5' },
  'arbitrum': { address :'0xf0E406c49C63AbF358030A299C0E00118C4C6BA5' },
  'fantom': { address :'0x3758AA66caD9F2606F1F501c9CB31b94b713A6d5' },
  'metis': { address :'0x3758AA66caD9F2606F1F501c9CB31b94b713A6d5' },
  'iotex': { address :'0xf0e406c49c63abf358030a299c0e00118c4c6ba5' },
  'optimism': { address :'0x3758AA66caD9F2606F1F501c9CB31b94b713A6d5' },
  'klaytn': { address :'0x3758aa66cad9f2606f1f501c9cb31b94b713a6d5' },
  'smartbch': { address :'0x3758AA66caD9F2606F1F501c9CB31b94b713A6d5', blackListedTokens: ['0x71df12b5a718e0110991bb641cb379077d9e8ef7'] },
  'enuls': { address :'0x3758AA66caD9F2606F1F501c9CB31b94b713A6d5' },
  'kava': { address :'0x3758AA66caD9F2606F1F501c9CB31b94b713A6d5' },
  'ethpow': { address :'0x67b3757f20DBFa114b593dfdAc2b3097Aa42133E' },
  'rei': { address :'0x3758AA66caD9F2606F1F501c9CB31b94b713A6d5' },
  'era': { address :'0x54C4A99Ee277eFF14b378405b6600405790d5045' },
  'eos_evm': { address :'0x3758AA66caD9F2606F1F501c9CB31b94b713A6d5' },
  'polygon_zkevm': { address :'0x3758AA66caD9F2606F1F501c9CB31b94b713A6d5' },
  'linea': { address :'0x8CD6e29d3686d24d3C2018CEe54621eA0f89313B' },
  'celo': { address :'0x3758AA66caD9F2606F1F501c9CB31b94b713A6d5' },
  'ethereumclassic': { address :'0x3758AA66caD9F2606F1F501c9CB31b94b713A6d5' },
  'base': { address :'0x3758AA66caD9F2606F1F501c9CB31b94b713A6d5' },
  'bitgert': { address :'0x3758AA66caD9F2606F1F501c9CB31b94b713A6d5' },
  'scroll': { address :'0x3758AA66caD9F2606F1F501c9CB31b94b713A6d5' },
  'manta': { address :'0x3758AA66caD9F2606F1F501c9CB31b94b713A6d5' },
  'zeta': { address :'0x3758AA66caD9F2606F1F501c9CB31b94b713A6d5' },
  'mode': { address :'0x3758AA66caD9F2606F1F501c9CB31b94b713A6d5' },
  'blast': { address :'0x3758AA66caD9F2606F1F501c9CB31b94b713A6d5' },
  'merlin': { address :'0x3758AA66caD9F2606F1F501c9CB31b94b713A6d5' },
  'xlayer': { address :'0x3758AA66caD9F2606F1F501c9CB31b94b713A6d5' },
  'pulse': { address :'0x0035cCA7Ff94156AEFcdd109bFD0C25083c1d89b' }
}

const nulsConfig = {
  ethereum: '0xa2791BdF2D5055Cda4d46EC17f9F429568275047',
  bsc: '0x8CD6e29d3686d24d3C2018CEe54621eA0f89313B',
  okexchain: '0x8cd6e29d3686d24d3c2018cee54621ea0f89313b',
}

const CHAIN_ALIASES = { era: 'zksync' }
const resolveChain = (chain) => CHAIN_ALIASES[chain] ?? chain;

let tokensConfTest;
async function getTokensConf() {
  return tokensConfTest ??= getConfig(
    'nerve-network-bridge',
    'https://assets.nabox.io/api/tvltokens',
  )
}

async function tvl (api) {
  const conf = await getTokensConf()

  const chainKey = resolveChain(api.chain)
  const tokensByLabel = conf[chainKey] ?? {}
  const tokens = Object.values(tokensByLabel)
  const { address, blackListedTokens = [] } = getBridgeContract[api.chain]
  return sumTokens2({ api, tokens, owners: [address], blackListedTokens })
}

async function tronTvl (api) {
  const conf = await getTokensConf()

  const tronTokensByLabel = conf.tron ?? {}
  const tokens = Object.values(tronTokensByLabel).filter(a => a !== EXCLUDED_TRX_ADDRESS)
  return sumTokens2({ api, owner: tronBridgeContract, tokens: [nullAddress, ...tokens] })
}

async function getSupply (chain) {
  const chainApi = new sdk.ChainApi({ chain })
  return chainApi.call({ target: nulsConfig[chain], abi: 'erc20:totalSupply' })
}

async function nulsTvl () {
  const url = 'https://public.nerve.network/asset/nuls'
  const nulsOnNerve = (await get(url)).total
  const supplies = (await Promise.all(Object.keys(nulsConfig).map(getSupply))).reduce((acc, val) => acc + Number(val), 0)
  return { nuls: (nulsOnNerve+supplies) / 10 ** 8 }
}

module.exports = {
  methodology: "Assets staked in the pool and trading contracts",
  doublecounted: true,
  nuls: { tvl : nulsTvl },
  bitcoin: { tvl: sumTokensExport({ owners: bitcoinAddressBook.nerveNetworkBridge }) },
  tron: { tvl: tronTvl },
}

Object.keys(getBridgeContract).forEach((chain) => {
  module.exports[chain] = { tvl }
})
