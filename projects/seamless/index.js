const { aaveExports } = require("../helper/aave");
const { sumTokens2 } = require("../helper/unwrapLPs");
const abi = require("./abis.json");
const { mergeExports } = require("../helper/utils");
const methodologies = require("../helper/methodologies");

const AAVE_ADDRESSES_PROVIDER_REGISTRY = "0x90C5055530C0465AbB077FA016a3699A3F53Ef99";
const AAVE_POOL_DATA_PROVIDER = "0x2A0979257105834789bC6b9E1B00446DFbA8dFBa";
const GEYSER_REGISTRY = "0xD5815fC3D736120d07a1fA92bA743c1167dA89d8";

async function geyserTvl(api) {
  const aTokens = await api.call({  abi: "function getAllATokens() view returns (tuple(string symbol, address tokenAddress)[])", target: AAVE_POOL_DATA_PROVIDER })
  const aTokenSet = new Set(aTokens.map(t => t.tokenAddress.toLowerCase()))
  const geysers = await api.fetchList({ lengthAbi: abi.instanceCount, itemAbi: abi.instanceAt, target: GEYSER_REGISTRY })
  const geysersData = await api.multiCall({ calls: geysers, abi: abi["getGeyserData"], })
  const stakingTokens = geysersData.map(d => d.stakingToken)
  const wrappedUnderlying = await api.multiCall({ calls: stakingTokens, abi: abi["underlying"], permitFailure: true, })
  const uTokens = wrappedUnderlying.filter(i => i && !aTokenSet.has(i.toLowerCase()))
  const uOwners = stakingTokens.filter((_, i) => wrappedUnderlying[i]&& !aTokenSet.has(wrappedUnderlying[i].toLowerCase()))

  const notWrappedTokensAndOwners = wrappedUnderlying.map((w, i) => {
    if (w) return;
    return [stakingTokens[i], geysers[i]];
  }).filter(i => i)

  const aTokenUnderlying = await api.multiCall({ calls: uTokens, abi: abi["UNDERLYING_ASSET_ADDRESS"], })

  const notATokenTokensAndOwners = aTokenUnderlying.map((w, i) => {
    if (w) return;
    return [uTokens[i], uOwners[i]];
  }).filter(i => i)

  const underlyingBalance = await api.multiCall({ calls: uOwners, abi: abi["totalUnderlying"], permitFailure: true, });

  await sumTokens2({ api, tokensAndOwners: [notATokenTokensAndOwners, notWrappedTokensAndOwners].flat(), });

  underlyingBalance.forEach((bal, i) => {
    if (!bal) return;
    api.add(aTokenUnderlying[i], bal)
  });

  return api.getBalances()
}

const baseAAVE = aaveExports("base", AAVE_ADDRESSES_PROVIDER_REGISTRY, undefined, [AAVE_POOL_DATA_PROVIDER], { v3: true });

module.exports = mergeExports([{
  methodology: methodologies.lendingMarket,
  base: baseAAVE,
}, { base: { tvl: geyserTvl } }]);
