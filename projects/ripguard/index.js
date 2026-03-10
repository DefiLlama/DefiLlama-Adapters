const { getLogs } = require("../helper/cache/getLogs");

// Sablier Lockup v2.0 on Base — RipGuard creates streams here directly
const SABLIER_LOCKUP = "0xb5D78DD3276325f5FAF3106Cc4Acc56E28e0Fe3B";

// Block when Sablier Lockup v2.0 was deployed on Base (safe baseline)
const START_BLOCK = 22000000;

// RipGuard sets shape="RipGuard" on every stream it creates.
// The shape field is emitted in the CreateLockupLinearStream event
// inside the commonParams struct. We filter by this to identify RipGuard streams.

const createEventAbi =
  "event CreateLockupLinearStream(uint256 indexed streamId, (address funder, address sender, address recipient, uint128 depositAmount, address token, bool cancelable, bool transferable, (uint40 start, uint40 end) timestamps, string shape) commonParams, uint40 cliffTime, (uint128 start, uint128 cliff) unlockAmounts)";

const getStreamAbi =
  "function getStream(uint256 streamId) view returns ((address sender, uint40 startTime, uint40 endTime, bool isCancelable, bool wasCanceled, address token, bool isDepleted, bool isTransferable, uint8 lockupModel, (uint128 deposited, uint128 withdrawn, uint128 refunded) amounts))";

async function tvl(api) {
  // 1. Get all CreateLockupLinearStream events from Sablier on Base
  const logs = await getLogs({
    api,
    target: SABLIER_LOCKUP,
    eventAbi: createEventAbi,
    fromBlock: START_BLOCK,
    onlyArgs: true,
  });

  // 2. Filter for RipGuard streams (shape == "RipGuard")
  const ripguardStreamIds = [];
  for (const log of logs) {
    const params = log.commonParams ?? log[1];
    const shape = params?.shape ?? params?.[8];
    if (shape === "RipGuard") {
      ripguardStreamIds.push((log.streamId ?? log[0]).toString());
    }
  }

  if (ripguardStreamIds.length === 0) return;

  // 3. Multicall getStream for each RipGuard stream to get current balances
  const streams = await api.multiCall({
    target: SABLIER_LOCKUP,
    abi: getStreamAbi,
    calls: ripguardStreamIds,
  });

  // 4. Sum (deposited - withdrawn - refunded) for each non-depleted stream
  for (const stream of streams) {
    const isDepleted = stream.isDepleted ?? stream[6];
    if (isDepleted) continue;
    const amounts = stream.amounts ?? stream[9];
    const deposited = BigInt(amounts.deposited ?? amounts[0]);
    const withdrawn = BigInt(amounts.withdrawn ?? amounts[1]);
    const refunded = BigInt(amounts.refunded ?? amounts[2]);
    const locked = deposited - withdrawn - refunded;
    if (locked > 0n) {
      const token = stream.token ?? stream[5];
      api.add(token, locked.toString());
    }
  }
}

module.exports = {
  methodology:
    "TVL is the sum of tokens locked in Sablier Lockup v2.0 streams created through RipGuard, identified by the 'RipGuard' shape tag on each stream. Locks are non-cancelable time-vaults. TVL decrements as locks vest and are withdrawn.",
  base: { tvl },
};
