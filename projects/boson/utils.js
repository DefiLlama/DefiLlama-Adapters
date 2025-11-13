const ethers = require("ethers");
const { getLogs } = require("../helper/cache/getLogs");

const {
  protocolDiamondAddress,
  protocolDeploymentBlock,
  fundsEncumberedTopic,
  fundsReleasedTopic,
  offerCreatedTopic_v2_0_0,
  offerCreatedTopic_v2_3_0,
  offerCreatedTopic_v2_4_0,
  offerCreatedTopic_v2_5_0,
  offerVoidedTopic,
  rangeReservedTopic,
  buyerCommittedTopic_v2_0_0,
  buyerCommittedTopic_v2_5_0,
  OfferCreatedEvent_v2_0_0,
  OfferCreatedEvent_v2_3_0,
  OfferCreatedEvent_v2_4_0,
  OfferCreatedEvent_v2_5_0,
  OfferVoidedEvent,
  RangeReservedEvent,
  FundsEncumberedEvent,
  FundsReleasedEvent,
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
    topics: [[offerCreatedTopic_v2_0_0, offerCreatedTopic_v2_3_0, offerCreatedTopic_v2_4_0, offerCreatedTopic_v2_5_0]],
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
  const iface = new ethers.Interface([BuyerCommittedEvent_v2_0_0, BuyerCommittedEvent_v2_5_0]);

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

async function getReservedRanges(api) {
  const logs = await getLogs({
    api,
    target: protocolDiamondAddress,
    topics: [rangeReservedTopic],
    fromBlock: protocolDeploymentBlock[api.chain],
    extraKey: "reservedRanges",
    eventAbi: RangeReservedEvent,
    onlyArgs: true,
  });

  const reservedRangeByOffer = {};

  for (const log of logs) {
    const offerId = BigInt(log.offerId);
    const startExchangeId = BigInt(log.startExchangeId);
    const endExchangeId = BigInt(log.endExchangeId);

    reservedRangeByOffer[offerId] = { startExchangeId, endExchangeId }; // there can be only one reserved range per offer
  }

  return reservedRangeByOffer;
}

async function getEncumberedFunds(api) {
  const FundsEncumberedLogs = await getLogs({
    api,
    target: protocolDiamondAddress,
    topics: [fundsEncumberedTopic],
    fromBlock: protocolDeploymentBlock[api.chain],
    eventAbi: FundsEncumberedEvent,
    onlyArgs: true,
    extraKey: "fundsEncumbered",
  });

  const encumberedByToken = {};
  for (const log of FundsEncumberedLogs) {
    const token = log.exchangeToken;
    const amount = BigInt(log.amount);
    encumberedByToken[token] = (encumberedByToken[token] || 0n) + amount;
  }

  const FundsReleasedLogs = await getLogs({
    api,
    target: protocolDiamondAddress,
    topics: [fundsReleasedTopic],
    fromBlock: protocolDeploymentBlock[api.chain],
    eventAbi: FundsReleasedEvent,
    onlyArgs: true,
    extraKey: "fundsReleased",
  });

  for (const log of FundsReleasedLogs) {
    const token = log.exchangeToken;
    const amount = BigInt(log.amount);
    encumberedByToken[token] -= amount;
  }

  return encumberedByToken;
}

module.exports = {
  getVoidedOffers,
  getOffers,
  getCommits,
  getReservedRanges,
  getEncumberedFunds,
};
