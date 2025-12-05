const { getTimestampAtStartOfDayUTC } = require("../helper/utils");
const { getLogs } = require("../helper/cache/getLogs");

const MINER_ADDRESS = "0xF69614F4Ee8D4D3879dd53d5A039eB3114C794F6";

const MINER_MINED_TOPIC =
  "0xc7df6706a5d0329f817217dcb0736bff7e6a29909dc28819c1fd4fe198127236";

const TREASURY_FEE_TOPIC =
  "0x37cc5ab17812d0e5a106defe33d607121c48f562ab71a54d25421e1571b401aa";

async function fetch(timestamp, _, { api }) {
  // Calculate start + end of the UTC day
  const fromTimestamp = getTimestampAtStartOfDayUTC(timestamp);
  const toTimestamp = fromTimestamp + 24 * 3600;

  // Query logs ONLY for this day
  const dailyFeesLogs = await api.getLogs({
    target: MINER_ADDRESS,
    topic: MINER_MINED_TOPIC,
    eventAbi:
      "event Miner__Mined(address indexed sender, address indexed miner, uint256 price, string uri)",
    onlyArgs: true,
    fromBlock: await api.getBlock(fromTimestamp),
    toBlock: await api.getBlock(toTimestamp),
  });

  const dailyTreasuryLogs = await api.getLogs({
    target: MINER_ADDRESS,
    topic: TREASURY_FEE_TOPIC,
    eventAbi:
      "event Miner__TreasuryFee(address indexed treasury, uint256 amount)",
    onlyArgs: true,
    fromBlock: await api.getBlock(fromTimestamp),
    toBlock: await api.getBlock(toTimestamp),
  });

  const totalFees = dailyFeesLogs.reduce(
    (acc, log) => acc + BigInt(log.price),
    0n
  );

  const totalTreasury = dailyTreasuryLogs.reduce(
    (acc, log) => acc + BigInt(log.amount),
    0n
  );

  const supplySide = totalFees - totalTreasury;

  return {
    timestamp,
    dailyFees: totalFees.toString(),
    dailyRevenue: totalTreasury.toString(),
    dailyProtocolRevenue: totalTreasury.toString(),
    dailySupplySideRevenue: supplySide.toString(),
  };
}

module.exports = {
  adapter: {
    base: {
      fetch,
      start: 1731017887, // Block 37882270 (Nov-07-2025 10:18:07 PM +UTC)
    },
  },
};
