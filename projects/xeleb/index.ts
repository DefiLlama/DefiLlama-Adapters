import sdk from "@defillama/sdk";

const TOKEN = "0xE32f9e8F7f7222fcd83EE0fC68bAf12118448Eaf";

const TRANSFER_TOPIC =
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

const DEAD_TOPIC =
  "0x000000000000000000000000000000000000000000000000000000000000dead";

const fetch = async (options: any) => {
  const logs = await sdk.api.eth.getLogs({
    target: TOKEN,
    fromBlock: options.fromBlock,
    toBlock: options.toBlock,
    chain: options.chain,
    topics: [TRANSFER_TOPIC, null, DEAD_TOPIC],
  });

  let dailyFees = 0n;

  for (const log of logs.output) {
    dailyFees += BigInt(log.data);
  }

  return {
    dailyFees: dailyFees.toString(),
    dailyRevenue: dailyFees.toString(),
    dailyProtocolRevenue: dailyFees.toString(),
  };
};

export default {
  bsc: {
    fetch,
    start: 59020532,
  },
};
