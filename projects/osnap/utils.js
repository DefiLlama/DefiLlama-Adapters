const axios = require("axios");
const defaultConcurrency = 200;
const maxRetries = 3;
const retrySleepTime = 10;

const sleep = (s) => new Promise((resolve) => setTimeout(resolve, s * 1000));

async function paginatedEventQuery(
  contract,
  filter,
  searchConfig,
  retryCount = 0
) {
  // If the max block look back is set to 0 then we dont need to do any pagination and can query over the whole range.
  if (searchConfig.maxBlockLookBack === 0)
    return await contract.queryFilter(
      filter,
      searchConfig.fromBlock,
      searchConfig.toBlock
    );

  // Compute the number of queries needed. If there is no maxBlockLookBack set then we can execute the whole query in
  // one go. Else, the number of queries is the range over which we are searching, divided by the maxBlockLookBack,
  // rounded up. This gives us the number of queries we need to execute to traverse the whole block range.
  const paginatedRanges = getPaginatedBlockRanges(searchConfig);
  const concurrency = searchConfig.concurrency || defaultConcurrency;

  try {
    const allEvents = [];

    for (let i = 0; i < paginatedRanges.length; i += concurrency) {
      const chunk = paginatedRanges.slice(i, i + concurrency);
      const events = await Promise.all(
        chunk.map(([fromBlock, toBlock]) => {
          return contract.queryFilter(filter, fromBlock, toBlock);
        })
      );
      allEvents.push(...events);
    }

    return (
      allEvents
        .flat()
        // Filter events by block number because ranges can include blocks that are outside the range specified for caching reasons.
        .filter(
          (event) =>
            event.blockNumber >= searchConfig.fromBlock &&
            event.blockNumber <= searchConfig.toBlock
        )
    );
  } catch (error) {
    if (retryCount < maxRetries) {
      await sleep(retrySleepTime);
      return await paginatedEventQuery(
        contract,
        filter,
        searchConfig,
        retryCount + 1
      );
    } else throw error;
  }
}

function getPaginatedBlockRanges({ fromBlock, toBlock, maxBlockLookBack }) {
  // If the maxBlockLookBack is undefined, we can look back as far as we like. Just return the entire range.
  if (maxBlockLookBack === undefined) return [[fromBlock, toBlock]];

  // If the fromBlock is > toBlock, then return no ranges.
  if (fromBlock > toBlock) return [];

  // A maxBlockLookBack of 0 is not allowed.
  if (maxBlockLookBack <= 0)
    throw new Error("Cannot set maxBlockLookBack <= 0");

  // Floor the requestedFromBlock to the nearest smaller multiple of the maxBlockLookBack to enhance caching.
  // This means that a range like 5 - 45 with a maxBlockLookBack of 20 would look like:
  // 0-19, 20-39, 40-45.
  // This allows us to get the max number of repeated node queries. The maximum number of "nonstandard" queries per
  // call of this function is 1.
  const flooredStartBlock =
    Math.floor(fromBlock / maxBlockLookBack) * maxBlockLookBack;

  // Note: range is inclusive, so we have to add one to the number of blocks to query.
  const iterations = Math.ceil(
    (toBlock + 1 - flooredStartBlock) / maxBlockLookBack
  );

  const ranges = [];
  for (let i = 0; i < iterations; i++) {
    // Each inner range start is just a multiple of the maxBlockLookBack added to the start block.
    const innerFromBlock = flooredStartBlock + maxBlockLookBack * i;

    // The innerFromBlock is just the max range from the innerFromBlock or the outer toBlock, whichever is smaller.
    // The end block should never be larger than the outer toBlock. This is to avoid querying blocks that are in the
    // future.
    const innerToBlock = Math.min(
      innerFromBlock + maxBlockLookBack - 1,
      toBlock
    );
    ranges.push([innerFromBlock, innerToBlock]);
  }

  return ranges;
}

async function getConfig(url) {
  const { data: json } = await axios.get(url);
  return json;
}

module.exports = {
  paginatedEventQuery,
  getConfig,
};
