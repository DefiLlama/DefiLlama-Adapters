const ADDRESSES = require('../helper/coreAssets.json')
const perpV2VaultABI = {
  "getBalanceByToken": "function getBalanceByToken(address trader, address token) view returns (int256)"
}
const perpLemmaWrapperABI = {
  "isUsdlCollateralTailAsset": "bool:isUsdlCollateralTailAsset"
}
const USDC = ADDRESSES.optimism.USDC;
const PERP_V2_VAULT = "0xAD7b4C162707E0B2b5f6fdDbD3f8538A5fbA0d60";

const tokens = [
  ADDRESSES.tombchain.FTM,
  ADDRESSES.optimism.WBTC,
  "0x350a791bfc2c21f9ed5d10980dad2e2638ffa7f6",
  "0x76FB31fb4af56892A25e32cFC43De717950c9278",
  "0x0994206dfe8de6ec6920ff4d779b0d950605fb53",
  "0x9e1028F5F1D5eDE59748FFceE5532509976840E0"
];
const perpLemmaWrappers = [
  "0x29b159aE784Accfa7Fb9c7ba1De272bad75f5674",
  "0xe161C6c9F2fC74AC97300e6f00648284d83cBd19",
  "0xdd4d71D3563C24E38525661896e1d01Fd8c2c9A5",
  "0xFE1EB36d31ead771Fd5E051ee8CC424dB6416567",
  "0x119f85ECFcFBC1d7033d266192626202Df7dbDf2",
  "0x13c214b430fE304C4C6437F3564A690cd4e4f23B"
];
//tracks only tvl on optimism (v2) as v1 (on arbitrum) is getting deprecated
async function tvl(api) {
  const isTailAssets = await api.multiCall({ abi: perpLemmaWrapperABI.isUsdlCollateralTailAsset, calls: perpLemmaWrappers, })
  const tokenBalances = await api.multiCall({ abi: perpV2VaultABI.getBalanceByToken, calls: perpLemmaWrappers.map((v, i) => ({ params: [v, tokens[i]]})),  target: PERP_V2_VAULT,})
  const usdcBalances = await api.multiCall({ abi: perpV2VaultABI.getBalanceByToken, calls: perpLemmaWrappers.map((v,) => ({ params: [v, USDC]})),  target: PERP_V2_VAULT,})

  api.add(USDC, usdcBalances)

  const tokensAndOwners = []

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const perpLemmaWrapper = perpLemmaWrappers[i];

    const isTailAsset = isTailAssets[i]

    if (isTailAsset) {
      //if tail asset than the tokens are in perpLemmaWrapper
      tokensAndOwners.push([token, perpLemmaWrapper]);
    } else {
      api.add(token, tokenBalances[i]);
    }
  }

  return api.sumTokens({ tokensAndOwners })
}

module.exports = {
  optimism: {
    tvl: tvl,
  }
}; 