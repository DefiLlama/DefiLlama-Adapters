const Web3 = require('web3');
const DefiLlamaSdk = require('@defillama/sdk');
const DfsAutomationSdk = require('@defisaver/automation-sdk');
const DfsPositionsSdk = require('@defisaver/positions-sdk');

const { sliceIntoChunks } = require('./helper/utils');

const providers = {
  1: new Web3(process.env.ETHEREUM_RPC),
  10: new Web3(process.env.OPTIMISM_RPC),
  42161: new Web3(process.env.ARBITRUM_RPC),
};

function strategiesMapping(chainId) {
  return ({
    1: new DfsAutomationSdk.EthereumStrategies({ provider: providers[1] }),
    10: new DfsAutomationSdk.OptimismStrategies({ provider: providers[10] }),
    42161: new DfsAutomationSdk.ArbitrumStrategies({ provider: providers[42161] }),
  })[chainId];
}

async function getStrategies(chainId, fromBlock) {
  const strategies = strategiesMapping(chainId).getSubscriptions({ mergeWithSameId: true, fromBlock });

  if (chainId === 1) {
    return (await Promise.all([
      strategies,
      new DfsAutomationSdk.LegacyMakerAutomation({ provider: providers[1] }).getSubscriptions({ fromBlock }),
      new DfsAutomationSdk.LegacyCompoundAutomation({ provider: providers[1] }).getSubscriptions({ fromBlock }),
      new DfsAutomationSdk.LegacyAaveAutomation({ provider: providers[1] }).getSubscriptions({ fromBlock }),
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

async function tvl(_0, _1, _2, obj) {
  const balances = {};

  const block = obj.block || 'latest';

  const subscriptions = (await getStrategies(obj.api.chainId, block)).filter(subscription => {
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

      const currentBalances = await accountBalanceGetter(providers[obj.api.chainId], obj.api.chainId, block, true, ...params);

      Object.entries(currentBalances).forEach(([poperty, values]) => {
        if (poperty !== 'debt') {
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