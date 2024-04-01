const contracts = require("./contracts.json");
const { sumTokens2, nullAddress } = require("../helper/unwrapLPs");

async function tvl(api) {
  const savvyPositionManagers = await api.call({ abi: 'address[]:getSavvyPositionManagers', target: contracts.infoAggregator, })
  console.log(savvyPositionManagers)
  const yieldStrategyManagers = await api.multiCall({ abi: 'address:yieldStrategyManager', calls: savvyPositionManagers, })
  console.log(yieldStrategyManagers)
  const savvySages = await api.multiCall({ abi: 'address:savvySage', calls: savvyPositionManagers, })

  const registeredBaseTokensCalls = (await api.multiCall({ abi: 'address[]:getRegisteredBaseTokens', calls: savvySages, })).flatMap((r, i) => {
    const target = savvySages[i];
    return r.map(params => ({ target, params }));
  });

  const savvySwaps = (await api.multiCall({ abi: 'function savvySwap(address baseToken) returns (address)', calls: registeredBaseTokensCalls }))
  const amos = (await api.multiCall({ abi: 'function amos(address baseToken) returns (address)', calls: registeredBaseTokensCalls, }))
  const passThroughAMOs = (await api.multiCall({ abi: 'address:recipient', calls: amos, permitFailure: true })).filter(y => y)
  console.log(passThroughAMOs)
  const baseTokens = (await api.multiCall({ abi: 'address[]:getSupportedBaseTokens', calls: yieldStrategyManagers, })).map(y => y)
  const yieldTokens = (await api.multiCall({ abi: 'address[]:getSupportedYieldTokens', calls: yieldStrategyManagers, })).map(y => y)

  const aTokens = (await api.multiCall({ abi: 'address:aToken', calls: yieldTokens, permitFailure: true })).filter(y => y)
  const rTokens = (await api.multiCall({ abi: 'address:rToken', calls: yieldTokens, permitFailure: true })).filter(y => y)
  const underlyingTokens = (await api.multiCall({ abi: 'address:token', calls: yieldTokens, permitFailure: true })).filter(y => y)

  console.log(aTokens)
  const tokens = [baseTokens, underlyingTokens, yieldTokens].flat(3)
  const tokenHolders = [savvyPositionManagers, savvySages, passThroughAMOs ].flat(3).filter(i => i !== nullAddress)
  const tokensAndOwners = tokenHolders.map((owner) => tokens.map((token) => [ token, owner ])).flat()


  const name1 = (await api.multiCall({ abi: 'string:name', calls: tokens, permitFailure: true }))
  const ownYieldTokens = tokens.filter((_, i) => name1[i] && name1[i].toLowerCase().includes('savvy yield'))
  const oyTokens = (await api.multiCall({  abi: 'address:aToken', calls: ownYieldTokens, permitFailure: true}))
  const oybTokens = (await api.multiCall({  abi: 'address:baseToken', calls: ownYieldTokens, permitFailure: true}))
  ownYieldTokens.forEach((_, i) => {
    if(oyTokens[i]) tokensAndOwners.push([oyTokens[i], ownYieldTokens[i]])
    if(oybTokens[i]) tokensAndOwners.push([oybTokens[i], ownYieldTokens[i]])
  })
  await sumTokens2({ tokens, api, tokensAndOwners, blacklistedTokens: ownYieldTokens });
}

module.exports = {
  methodology: 'The calculated TVL is the current sum of all base tokens and yield tokens in our contracts.',
  arbitrum: {
    tvl
  },
  hallmarks: [
    [1691473498, "LBP Launch"]
  ]
}