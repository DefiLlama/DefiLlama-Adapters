const Web3 = require('web3');
const DefiLlamaSdk = require('@defillama/sdk');
const DfsAutomationSdk = require('@defisaver/automation-sdk');
const DfsPositionsSdk = require('@defisaver/positions-sdk');

const { sliceIntoChunks } = require('./helper/utils');

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

async function tvl(timestamp, ethBlock, networkBlockMapping, chainApi) {
  const balances = {};

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
  ethereum: { tvl },
  arbitrum: { tvl },
  optimism: { tvl },
};