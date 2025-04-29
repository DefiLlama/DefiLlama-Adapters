const { getLogs2 } = require("../helper/cache/getLogs");
const { sumTokens2 } = require("../helper/unwrapLPs");
const abi = require("./abis.json");
const { mergeExports } = require("../helper/utils");

const SEAMLESS_GOVERNOR_SHORT_TIMELOCK = "0x639d2dD24304aC2e6A691d8c1cFf4a2665925fee";
const MORPHO_VAULTS_FACTORY_v1_1 = "0xFf62A7c278C62eD665133147129245053Bbf5918";
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

const SeamlesMorphoVaultsTVL = async (api) => {
  const allVaults = (
    await getLogs2({
      api,
      factory: MORPHO_VAULTS_FACTORY_v1_1,
      eventAbi:
        "event CreateMetaMorpho(address indexed metaMorpho, address indexed caller, address initialOwner, uint256 initialTimelock, address indexed asset, string name, string symbol, bytes32 salt)",
      fromBlock: 24831748,
    })
  ).map((log) => log.metaMorpho);

  const allVaultOwners = await api.multiCall({
    calls: allVaults,
    abi: "function owner() public view returns (address)",
  });

  const seamlessMorphoVaults = allVaults.filter(
    (_, i) =>
      allVaultOwners[i].toLowerCase() ===
      SEAMLESS_GOVERNOR_SHORT_TIMELOCK.toLowerCase()
  );

  const underlyingAssets = await api.multiCall({
    calls: seamlessMorphoVaults,
    abi: "function asset() public view returns (address)",
  });
  const totalAssets = await api.multiCall({
    calls: seamlessMorphoVaults,
    abi: "function totalAssets() public view returns (uint256)",
  });

  underlyingAssets.forEach((asset, i) => {
    api.add(asset, totalAssets[i]);
  });

  return api.getBalances();
};

const methodology = `Counts the tokens deposited in Seamless Protocol owned vaults even when those vaults exist on other protocols (this is marked as double counted).`;

module.exports = mergeExports([
  { base: { tvl: geyserTvl } },
  {
    doublecounted: true,
    base: { tvl: SeamlesMorphoVaultsTVL },
  },
  { methodology },
]);
