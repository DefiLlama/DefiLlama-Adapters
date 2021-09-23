const sdk = require("@defillama/sdk");
const getEntireSystemCollAbi = require("./getEntireSystemColl.abi.json")

const MATIC_ADDRESS = '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0';
const TROVE_MANAGER_ADDRESS = "0xA2A065DBCBAE680DF2E6bfB7E5E41F1f1710e63b";

async function tvl(_, _ethBlock, chainBlocks) {
  const balance = (
    await sdk.api.abi.call({
      target: TROVE_MANAGER_ADDRESS,
      abi: getEntireSystemCollAbi,
      block: chainBlocks['polygon'],
      chain: 'polygon'
    })
  ).output;

  return { [MATIC_ADDRESS]: balance };
}

module.exports = {
  tvl,
};
