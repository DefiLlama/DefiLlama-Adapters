const ADDRESSES = require('../helper/coreAssets.json')
const sui = require("../helper/chain/sui");

const EVENT_TYPES = {
  DEPOSIT: "0xe8087c2b86351ce15e8d72e83a39c5772c0b1d054015ae9671305e686cef5034::suidollar::Deposit",
  WITHDRAW: "0xe8087c2b86351ce15e8d72e83a39c5772c0b1d054015ae9671305e686cef5034::suidollar::Withdraw"
};

async function getAllEvents(eventType) {
  let hasMore = true;
  let cursor = null;
  let allEvents = [];

  while (hasMore) {
    const events = await sui.queryEvents({ 
      eventType,
      transform: i => i,
      cursor,
      limit: 50
    });

    if (Array.isArray(events) && events.length > 0) {
      allEvents = allEvents.concat(events);
    }

    if (events.hasNextPage && events.nextCursor) {
      cursor = events.nextCursor;
    } else {
      hasMore = false;
    }
  }

  return allEvents.map(event => eventType === EVENT_TYPES.DEPOSIT ? event.deposit_amount : event.amount)
    .filter(amount => amount !== undefined);
}

async function tvl(api) {
  const deposits = await getAllEvents(EVENT_TYPES.DEPOSIT);
  const withdraws = await getAllEvents(EVENT_TYPES.WITHDRAW);

  let totalBalance = 0n;

  deposits.forEach(amount => amount && (totalBalance += BigInt(amount)));
  withdraws.forEach(amount => amount && (totalBalance -= BigInt(amount)));
  
  api.add(ADDRESSES.sui.USDC_CIRCLE, totalBalance);

  return api.getBalances();
}

module.exports = {
  timetravel: false,
  sui: {
    tvl
  },
  methodology: "Calculates TVL by tracking deposit and withdrawal events"
} 