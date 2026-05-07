const ethers = require("ethers");
const { getLogs } = require("../helper/cache/getLogs");
const sdk = require('@defillama/sdk');

const {
  protocolDiamondAddress,
  protocolDeploymentBlock,
  fundsDepositedTopic,
  fundsEncumberedTopic,
  offerCreatedTopic_v2_0_0,
  offerCreatedTopic_v2_3_0,
  offerCreatedTopic_v2_4_0,
  offerCreatedTopic_v2_5_0,
  offerVoidedTopic,
  buyerCommittedTopic_v2_0_0,
  buyerCommittedTopic_v2_5_0,
  OfferCreatedEvent_v2_0_0,
  OfferCreatedEvent_v2_3_0,
  OfferCreatedEvent_v2_4_0,
  OfferCreatedEvent_v2_5_0,
  OfferVoidedEvent,
  FundsDepositedEvent,
  FundsEncumberedEvent,
  BuyerCommittedEvent_v2_0_0,
  BuyerCommittedEvent_v2_5_0,
} = require("./constants");

async function getVoidedOffers(api) {
  const logs = await getLogs({
    api,
    target: protocolDiamondAddress,
    topics: [offerVoidedTopic],
    fromBlock: protocolDeploymentBlock[api.chain],
    eventAbi: OfferVoidedEvent,
    onlyArgs: true,
    extraKey: "offerVoided",
  });

  return logs.map((i) => BigInt(i.offerId));
}

async function getOffers(api, voidedOffers = []) {
  const response = await getLogs({
    api,
    target: protocolDiamondAddress,
    topics: [
      [
        offerCreatedTopic_v2_0_0,
        offerCreatedTopic_v2_3_0,
        offerCreatedTopic_v2_4_0,
        offerCreatedTopic_v2_5_0,
      ],
    ],
    fromBlock: protocolDeploymentBlock[api.chain],
    extraKey: "offerCreated",
  });

  // Combine all versions of the OfferCreated event
  const iface = new ethers.Interface([
    OfferCreatedEvent_v2_0_0,
    OfferCreatedEvent_v2_3_0,
    OfferCreatedEvent_v2_4_0,
    OfferCreatedEvent_v2_5_0,
  ]);

  const parsedLogs = response.map((log) => {
    return iface.parseLog(log)?.args;
  });

  const blockTimestamp = BigInt(api.timestamp);

  return parsedLogs.filter(
    (i) =>
      !voidedOffers.includes(BigInt(i.offerId)) &&
      BigInt(i?.offerDates?.validUntil) >= blockTimestamp &&
      BigInt(i?.offerDates?.validFrom) < blockTimestamp
  );
}

async function getCommits(api) {
  const response = await getLogs({
    api,
    target: protocolDiamondAddress,
    topics: [[buyerCommittedTopic_v2_0_0, buyerCommittedTopic_v2_5_0]],
    fromBlock: protocolDeploymentBlock[api.chain],
    extraKey: "buyerCommitted",
  });

  // Combine all versions of the BuyerCommitted event
  const iface = new ethers.Interface([
    BuyerCommittedEvent_v2_0_0,
    BuyerCommittedEvent_v2_5_0,
  ]);

  const parsedLogs = response.map((log) => {
    return iface.parseLog(log)?.args;
  });

  const commitsByOffer = {};

  for (const commit of parsedLogs) {
    const offerId = BigInt(commit.offerId);
    if (!commitsByOffer[offerId]) {
      commitsByOffer[offerId] = [commit.exchangeId];
    } else {
      commitsByOffer[offerId].push(commit.exchangeId);
    }
  }

  return commitsByOffer;
}

async function getDepositedAndEncumberedBalances(api) {
  const response = await getLogs({
    api,
    target: protocolDiamondAddress,
    topics: [[fundsDepositedTopic, fundsEncumberedTopic]],
    fromBlock: protocolDeploymentBlock[api.chain],
    extraKey: "incomingFunds",
  });

  // Combine all versions of the OfferCreated event
  const iface = new ethers.Interface([
    FundsDepositedEvent,
    FundsEncumberedEvent,
  ]);

  const parsedLogs = response.map((log) => {
    return iface.parseLog(log)?.args;
  });

  // Get the ERC20 token list
  const uniqueTokens = Array.from(new Set(
    parsedLogs.map((i) => i.tokenAddress || i.exchangeToken)
  ));

  const balances = {}
  const uniqueERC20Tokens = uniqueTokens.filter(token => token !== ethers.ZeroAddress);
  if (uniqueERC20Tokens.length > 0) {
    const tokenBalances = await sdk.api.abi.multiCall({
      calls: uniqueERC20Tokens.map(token => ({
        target: token,
        params: [protocolDiamondAddress]
      })),
      abi: 'erc20:balanceOf',
      chain: api.chain,
      block: api.block,
    });
    sdk.util.sumMultiBalanceOf(balances, tokenBalances,true);

    api.addTokens(Object.keys(balances), Object.values(balances));
  }

  // Get native token balance
  if (uniqueTokens.includes(ethers.ZeroAddress)) {
    const { output: nativeBalance } = await sdk.api.eth.getBalance({ target: protocolDiamondAddress, chain: api.chain, block: api.block })
    api.addToken(ethers.ZeroAddress, nativeBalance);
  }  
}

module.exports = {
  getVoidedOffers,
  getOffers,
  getCommits,
  getDepositedAndEncumberedBalances,
};
