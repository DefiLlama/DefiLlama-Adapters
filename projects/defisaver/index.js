// const Web3 = require('web3');
const DefiLlamaSdk = require('@defillama/sdk');
const { getLogs } = require('../helper/cache/getLogs')
// const DfsAutomationSdk = require('@defisaver/automation-sdk');
// const DfsPositionsSdk = require('@defisaver/positions-sdk');

const { sliceIntoChunks } = require('../helper/utils');
const config = require('./config');

function strategiesMapping(chainId, provider) {
  return ({
    1: new DfsAutomationSdk.EthereumStrategies({ provider }),
    10: new DfsAutomationSdk.OptimismStrategies({ provider }),
    42161: new DfsAutomationSdk.ArbitrumStrategies({ provider }),
  })[chainId];
}

async function getStrategies(chainId, fromBlock, provider) {
  const strategies = strategiesMapping(chainId, provider).getSubscriptions({ mergeWithSameId: true, fromBlock });

  if (chainId === 1) {
    return (await Promise.all([
      strategies,
      new DfsAutomationSdk.LegacyMakerAutomation({ provider }).getSubscriptions({ fromBlock }),
      new DfsAutomationSdk.LegacyCompoundAutomation({ provider }).getSubscriptions({ fromBlock }),
      new DfsAutomationSdk.LegacyAaveAutomation({ provider }).getSubscriptions({ fromBlock }),
    ])).flat();
  }

  return strategies;
}

function accountBalancesMapping(protocolIdentifier) {
  return ({
    [DfsAutomationSdk.enums.ProtocolIdentifiers.StrategiesAutomation.AaveV2]: DfsPositionsSdk.aaveV2.getAaveV2AccountBalances,
    [DfsAutomationSdk.enums.ProtocolIdentifiers.StrategiesAutomation.AaveV3]: DfsPositionsSdk.aaveV3.getAaveV3AccountBalances,
    [DfsAutomationSdk.enums.ProtocolIdentifiers.StrategiesAutomation.Spark]: DfsPositionsSdk.spark.getSparkAccountBalances,
    [DfsAutomationSdk.enums.ProtocolIdentifiers.StrategiesAutomation.MorphoAaveV2]: DfsPositionsSdk.morphoAaveV2.getMorphoAaveV2AccountBalances,
    [DfsAutomationSdk.enums.ProtocolIdentifiers.StrategiesAutomation.CompoundV2]: DfsPositionsSdk.compoundV2.getCompoundV2AccountBalances,
    [DfsAutomationSdk.enums.ProtocolIdentifiers.StrategiesAutomation.CompoundV3]: DfsPositionsSdk.compoundV3.getCompoundV3AccountBalances,
    [DfsAutomationSdk.enums.ProtocolIdentifiers.StrategiesAutomation.Liquity]: DfsPositionsSdk.liquity.getLiquityAccountBalances,
    [DfsAutomationSdk.enums.ProtocolIdentifiers.StrategiesAutomation.MakerDAO]: DfsPositionsSdk.maker.getMakerAccountBalances,
    [DfsAutomationSdk.enums.ProtocolIdentifiers.StrategiesAutomation.ChickenBonds]: DfsPositionsSdk.chickenBonds.getChickenBondsAccountBalances,
    [DfsAutomationSdk.enums.ProtocolIdentifiers.StrategiesAutomation.Exchange]: DfsPositionsSdk.exchange.getExchangeAccountBalances,
  })[protocolIdentifier];
}

async function _tvl(timestamp, ethBlock, networkBlockMapping, chainApi) {
  const balances = {};

  return balances

  const rpcUrl = chainApi.api.provider.providerConfigs[0].provider.connection.url;
  const provider = new Web3(rpcUrl);
  const block = networkBlockMapping[chainApi.chain];

  const subscriptions = (await getStrategies(chainApi.api.chainId, block, provider)).filter(subscription => {
    if (
      subscription.protocol.id === DfsAutomationSdk.enums.ProtocolIdentifiers.StrategiesAutomation.Exchange
      && subscription.strategy.strategyId === DfsAutomationSdk.enums.Strategies.Identifiers.LimitOrder
    ) {
      return subscription.isEnabled && (subscription.strategyData.decoded.triggerData.goodUntil > (Date.now() / 1000));
    }
    return subscription.isEnabled;
  });

  const subChunks = sliceIntoChunks(subscriptions, 30);

  for (const chunk of subChunks) {

    await Promise.all(chunk.map(async (subscription) => {

      const accountBalanceGetter = accountBalancesMapping(subscription.protocol.id);

      let params;

      if (subscription.strategy.strategyId !== 'legacy') {
        params = [subscription.strategyData.decoded.triggerData.owner];

        if (subscription.protocol.id === DfsAutomationSdk.enums.ProtocolIdentifiers.StrategiesAutomation.CompoundV3) {
          params.push(subscription.strategyData.decoded.triggerData.market.toLowerCase());
        }
        if (subscription.protocol.id === DfsAutomationSdk.enums.ProtocolIdentifiers.StrategiesAutomation.MakerDAO) {
          params = [subscription.strategyData.decoded.triggerData.vaultId];
        }
        if (subscription.protocol.id === DfsAutomationSdk.enums.ProtocolIdentifiers.StrategiesAutomation.Liquity) {
          params = [subscription.owner];
        }
        if (subscription.protocol.id === DfsAutomationSdk.enums.ProtocolIdentifiers.StrategiesAutomation.ChickenBonds) {
          params = [subscription.strategyData.decoded.triggerData.bondId];
        }
        if (subscription.protocol.id === DfsAutomationSdk.enums.ProtocolIdentifiers.StrategiesAutomation.Exchange) {
          params = [subscription.strategyData.decoded.subData];
        }
      } else {
        params = [subscription.specific.user]

        if (subscription.protocol.id === DfsAutomationSdk.enums.ProtocolIdentifiers.StrategiesAutomation.MakerDAO) {
          params = [subscription.specific.cdpId];
        }
      }

      const currentBalances = await accountBalanceGetter(provider, chainApi.api.chainId, block, true, ...params);

      Object.entries(currentBalances).forEach(([property, values]) => {
        if (property !== 'debt') {
          DefiLlamaSdk.util.mergeBalances(balances, values);
        }
      });
    }));
  }

  return balances;
}

module.exports = {
  doublecounted: true,
  methodology: 'TVL accounts for all assets deposited into the automated strategies.',
};

Object.keys(config).forEach(chain => {
  const { subscriptions } = config[chain]
  module.exports[chain] = {
    tvl: async (_, _b, _cb, { api, }) => {
      const logs = await Promise.all(subscriptions.map(sub => getSubscriptions(api, sub)))
      console.log(logs[0].subscribeLogs.length, logs[0].updateLogs.length)
      console.log(logs[0].subscribeLogs[0], logs[0].updateLogs[0], chain, logs[0].updateLogs[0].args.subId)
      // const allLogs = logs.flat()
      // console.log(allLogs[0], chain)
      // console.log(allLogs.length)
      return {}
    }
  }
})

async function getSubscriptions(api, { target, fromBlock }) {
  const subscribeLogs = await getLogs({ api, target, eventAbi: subscriptionAbis.Subscribe, onlyArgs: true, fromBlock, topics: ['0x7791eea7fd5a877940fd0654c6b1e05911293cedabdfe1f99b7c2cb0308dbaf7'], extraKey: 'Subscribe' })
  const updateLogs = await getLogs({ api, target, eventAbi: subscriptionAbis.UpdateData, onlyArgs: false, fromBlock, topics: ['0x1fdee328afa41b70ae10ae58d8e54117600357f6737bca0764ddb6fcad6ac9dd'], extraKey: 'UpdateData' })
  updateLogs.sort((a, b) => a.blockNumber - b.blockNumber)
  console.log(JSON.stringify(updateLogs[0].blockNumber, null, 2),JSON.stringify(updateLogs[1].blockNumber, null, 2), api.chain)
  const subIds = subscribeLogs.map(log => +log.subId)
  const strategiesSubs = await api.multiCall({  abi: subscriptionAbis.strategiesSubs, calls: subIds, target,})
  console.log(strategiesSubs[0], api.chain)
  const subscriptions = strategiesSubs.map((sub, i) => {
    let latestUpdate = subscribeLogs[i];

    if (latestUpdate.subHash !== sub?.strategySubHash) {
      const lastUpdate = updateLogs.find(log => log.args.subId === latestUpdate.subId);
      latestUpdate = {
        ...latestUpdate, // Update is missing proxy, hence this
        ...lastUpdate,
      };
    }
    return getParsedSubscriptions({
      chainId: api.chainId,
      subscriptionEventData: latestUpdate,
      strategiesSubsData: sub,
    });
  })

  return { subscribeLogs, updateLogs }
}

const subscriptionAbis = {
  "Subscribe": "event Subscribe(uint256 indexed subId, address indexed proxy, bytes32 indexed subHash, tuple(uint64 strategyOrBundleId, bool isBundle, bytes[] triggerData, bytes32[] subData) subStruct)",
  "UpdateData": "event UpdateData(uint256 indexed subId, bytes32 indexed subHash, tuple(uint64 strategyOrBundleId, bool isBundle, bytes[] triggerData, bytes32[] subData) subStruct)",
  "ActivateSub": "event ActivateSub(uint256 indexed subId)",
  "DeactivateSub": "event DeactivateSub(uint256 indexed subId)",
  "activateSub": "function activateSub(uint256 _subId)",
  "adminVault": "address:adminVault",
  "deactivateSub": "function deactivateSub(uint256 _subId)",
  "getSub": "function getSub(uint256 _subId) view returns (tuple(bytes20 userProxy, bool isEnabled, bytes32 strategySubHash))",
  "getSubsCount": "uint256:getSubsCount",
  "kill": "function kill()",
  "registry": "address:registry",
  "strategiesSubs": "function strategiesSubs(uint256) view returns (bytes20 userProxy, bool isEnabled, bytes32 strategySubHash)",
  "subscribeToStrategy": "function subscribeToStrategy(tuple(uint64 strategyOrBundleId, bool isBundle, bytes[] triggerData, bytes32[] subData) _sub) returns (uint256)",
  "updateSubData": "function updateSubData(uint256 _subId, tuple(uint64 strategyOrBundleId, bool isBundle, bytes[] triggerData, bytes32[] subData) _sub)",
  "withdrawStuckFunds": "function withdrawStuckFunds(address _token, address _receiver, uint256 _amount)"
}

function getParsedSubscriptions(parseData){
  const {
    chainId, subscriptionEventData, strategiesSubsData,
  } = parseData;
  const {
    subStruct, proxy, subId, subHash,
  } = subscriptionEventData;
  const { isEnabled } = strategiesSubsData;

  const id = subStruct.strategyOrBundleId;

  const strategyOrBundleInfo = (
    subStruct.isBundle
      ? BUNDLES_INFO[chainId][id]
      : STRATEGIES_INFO[chainId][id]
  );

  if (!strategyOrBundleInfo) return null;

  const position = {
    isEnabled,
    chainId,
    subHash,
    subId: Number(subId),
    owner: proxy,
    protocol: {
      ...strategyOrBundleInfo.protocol,
    },
    strategy: {
      isBundle: subStruct.isBundle,
      ...strategyOrBundleInfo,
    },
    strategyData: {
      encoded: {
        triggerData: subStruct.triggerData,
        subData: subStruct.subData,
      },
      decoded: {
        triggerData: null,
        subData: null,
      },
    },
    specific: {},
  };

  return getParsingMethod(position.protocol.id, position.strategy)(position, parseData, chainId);
}