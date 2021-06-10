const sdk = require("@defillama/sdk");
const getEntireSystemCollAbi = require("./getEntireSystemColl.abi.json")

const BNB_ADDRESS = 'bsc:0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c';

// TroveManager has a record of total system collateral
const TROVE_MANAGER_ADDRESS = "0xe041c4099C0d6dcfC52C56A556EE4289D2E4b7C5";

async function tvl(_, block, chainBlocks) {
  const balance = (
    await sdk.api.abi.call({
      target: TROVE_MANAGER_ADDRESS,
      abi: getEntireSystemCollAbi,
      block: chainBlocks['bsc'],
      chain: 'bsc'
    })
  ).output;

  return { [BNB_ADDRESS]: balance };
}

module.exports = {
  tvl,
};
