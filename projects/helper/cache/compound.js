
const sdk = require('@defillama/sdk');
const abi = require('../abis/compound.json');
const { nullAddress, unwrapLPsAuto } = require('../unwrapLPs');
const { requery } = require("../requery");
const { getCache, setCache } = require("../cache");
const { getChainTransform, getFixBalancesSync, } = require('../portedTokens');
const { usdtAddress } = require('../balances');
const agoraAbi = require("../../agora/abi.json");

const project = 'compound'
const getKey = (chain, addr) => `${chain}/${addr}`

function compoundExports(comptroller, { blacklistedTokens = [], resolveLps = false, transformAdress, abis = {}} = {}) {
  let response
  abis = { ...abi, ...abis }

  async function _getCompoundV2Tvl(api) {
    if (!response) response = _internal()
    return response

    async function _internal() {
      const balances = {
        tvl: {},
        borrowed: {},
      }
      const chain = api.chain ?? 'ethereum'
      blacklistedTokens = blacklistedTokens.map(i => i.toLowerCase())
      if (!transformAdress) transformAdress = await getChainTransform(chain)
      const fixBalances = getFixBalancesSync(chain)

      let markets = await api.call({
        target: comptroller,
        abi: abis.getAllMarkets,
      })

      let underlying = await api.multiCall({
        abi: abis.underlying,
        calls: markets,
      })
      let borrowed = await api.multiCall({
        abi: abis.totalBorrows,
        calls: markets,
      })
      let values = await api.multiCall({
        abi: abis.getCash,
        calls: markets,
      })
      underlying = underlying.map((token, i) => {
        if (!token || token === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') token = nullAddress
        token = transformAdress(token)
        sdk.util.sumSingleBalance(balances.tvl,token,values[i])
        sdk.util.sumSingleBalance(balances.borrowed,token,borrowed[i])
      })

      balances.tvl = fixBalances(balances.tvl)
      balances.borrowed = fixBalances(balances.borrowed)

      return balances
    }
  }

  return {
    tvl: async (api) => (await _getCompoundV2Tvl(api)).tvl,
    borrowed: async (api) => (await _getCompoundV2Tvl(api)).borrowed,
  }
}


module.exports = {
  compoundExports,
};


