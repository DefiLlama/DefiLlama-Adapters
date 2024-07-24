const { graphQuery, } = require("../helper/http");

const HOURS_12 = 12 * 3600

async function getBlock(endpoint, timestamp) {
  if (typeof timestamp === "object" && timestamp.timestamp) timestamp = timestamp.timestamp
  const params = {
    timestamp_from: timestamp - HOURS_12 * 2,
    timestamp_to: timestamp + HOURS_12 * 2,
  }
  const query = `query ($timestamp_to: Int, $timestamp_from: Int){
    blocks (orderBy: "timestamp" first:1 orderDirection: "desc" where: { timestamp_lte: $timestamp_to timestamp_gte: $timestamp_from}) {
      timestamp
      number
    }
  }` 
  const { blocks } = await graphQuery(endpoint, query, params)
  return blocks[0].number
}

module.exports = {
  getBlock,
};
