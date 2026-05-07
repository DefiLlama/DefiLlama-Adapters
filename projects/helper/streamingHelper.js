const ADDRESSES = require('./coreAssets.json')
const { getUniqueAddresses } = require('./tokenMapping')
let stableTokens = ['USDC', 'USDT', 'DAI', 'WETH', 'WFTM', 'WGLMR', 'WBNB', 'WAVAX', 'JCHF', 'JEUR', 'WBTC', 'AGDAI', 'JPYC',
  'MIMATIC', 'WXDAI', 'EURS', 'JGBP', 'CNT', 'USD+', 'AMUSDC', 'RAI', 'SLP', 'SDAM3CRV', 'AMDAI', 'TUSD', 'RAI', 'UNI-V2', 'SLP', 'ScUSDC',
  'cUSDC', 'iDAI', 'FTM', 'yUSDC', 'cDAI', 'MATIC', 'UST', 'stETH', 'USD', 'mUSD', 'iUSDC', 'aDAI', 'AGEUR', 'BCT', 'WMATIC', 
  'DAI.e', 'USDC.e', 'USDT.e', 'BUSD', 'WKAVA', 'axlUSDC',
].map(i => i.toUpperCase())

function isStableToken(symbol = '', address = '') {
  return stableTokenAddresses.includes(address.toLowerCase()) || stableTokens.includes(symbol.toUpperCase())
}

async function getWhitelistedTokens({ api, tokens, isVesting  }) {
  tokens = getUniqueAddresses(tokens, api.chain)
  let symbols = []
  if (!['solana', 'sui', 'aptos'].includes(api.chain)) {
    symbols = await api.multiCall({  abi: 'string:symbol', calls: tokens, permitFailure: true})
  }
  tokens = tokens.filter((v, i) => isWhitelistedToken(symbols[i], v, isVesting))
  return tokens
}

function isWhitelistedToken(symbol, address, isVesting) {
  const isStable = isStableToken(symbol, address)
  return isVesting ? !isStable : isStable
}

const stableTokenAddresses = [
  // native token
  ADDRESSES.null,

  // metis
  ADDRESSES.metis.m_USDC,
  ADDRESSES.metis.BUSD,

  // avax
  ADDRESSES.avax.DAI,
  ADDRESSES.avax.USDC_e,
  ADDRESSES.avax.USDC,
  '0x0f577433Bf59560Ef2a79c124E9Ff99fCa258948',

  // xdai
  ADDRESSES.xdai.WXDAI,
  ADDRESSES.xdai.USDT,
  '0x91f8490eC27cbB1b2FaEdd29c2eC23011d7355FB',

  // fantom
  ADDRESSES.fantom.DAI,
  '0x6Fc9383486c163fA48becdEC79d6058f984f62cA',
  ADDRESSES.fantom.USDC,
  ADDRESSES.fantom.WFTM,

  // ethereum
  ADDRESSES.ethereum.DAI,
  ADDRESSES.ethereum.USDC,
  ADDRESSES.ethereum.USDT,
  ADDRESSES.ethereum.FRAX,
  '0xe2f2a5C287993345a840Db3B0845fbC70f5935a5',
  ADDRESSES.ethereum.WETH,

  // polygon
  ADDRESSES.polygon.DAI,
  ADDRESSES.polygon.USDT,
  ADDRESSES.polygon.USDC,
  '0xC2DbaAEA2EfA47EBda3E572aa0e55B742E408BF6',
  ADDRESSES.polygon.WMATIC_1,
  '0x4198A31A98dB56b48AEBa6103F7C23679B9794F3',

  // bsc
  ADDRESSES.bsc.DAI,
  ADDRESSES.bsc.BUSD,
  ADDRESSES.bsc.USDT,
  ADDRESSES.bsc.USDC,

  // arbitrum
  ADDRESSES.optimism.DAI,
  ADDRESSES.arbitrum.WETH,
  '0x662d0f9Ff837A51cF89A1FE7E0882a906dAC08a3',
  ADDRESSES.arbitrum.USDC,
  '0x64343594Ab9b56e99087BfA6F2335Db24c2d1F17',
  ADDRESSES.arbitrum.USDT,

  // optimism
  ADDRESSES.optimism.DAI,
  ADDRESSES.optimism.USDC,

  // meter
  ADDRESSES.meter.MTR,
  ADDRESSES.meter.USDC_eth,
  ADDRESSES.meter.BUSD_bsc,
  ADDRESSES.meter.USDT_eth,
  '0x687A6294D0D6d63e751A059bf1ca68E4AE7B13E2',

  ADDRESSES.solana.SOL,
  ADDRESSES.solana.USDC,
  ADDRESSES.solana.USDT,

  ADDRESSES.sui.SUI,
  ADDRESSES.sui.USDC,
  ADDRESSES.sui.WETH,
  ADDRESSES.sui.USDT,

  ADDRESSES.aptos.APT,
  ADDRESSES.aptos.USDC,
  ADDRESSES.aptos.USDC_1,
  ADDRESSES.aptos.USDC_2,
  ADDRESSES.aptos.USDT,
  ADDRESSES.aptos.USDT_2,


].map(i => i.toLowerCase())

module.exports = {
  stableTokens,
  stableTokenAddresses,
  isStableToken,
  isWhitelistedToken,
  getWhitelistedTokens,
}