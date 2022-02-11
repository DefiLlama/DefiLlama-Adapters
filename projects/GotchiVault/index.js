const sdk = require('@defillama/sdk');
const { transformPolygonAddress } = require('../helper/portedTokens');
const abi = require("./abi.json");


const VGHST_CONTRACT = "0x51195e21BDaE8722B29919db56d95Ef51FaecA6C";
const GHST_CONTRACT = "0x385Eeac5cB85A38A9a07A70c73e0a3271CfB54A7";

async function tvl(timestamp, block, chainBlocks) {
  const balances = {};
  const transform = await transformPolygonAddress();

  const collateralBalance = (await sdk.api.abi.call({
    abi: abi.totalGHST,
    chain: 'polygon',
    target: VGHST_CONTRACT,
    params: [VGHST_CONTRACT],
    block: chainBlocks['polygon'],
  })).output;

  await sdk.util.sumSingleBalance(balances, transform(GHST_CONTRACT), collateralBalance)

  return balances;
}

module.exports = {
  methodology:
    "TVL counts the total GHST tokens that are staked by the Gotchi Vault contracts",
    polygon: {
    tvl,
  }
};