const sdk = require("@defillama/sdk")

const ALPHA1_V1_CONTRACT = '0xdE4133f0CFA1a61Ba94EC64b6fEde4acC1fE929E';
const ALPHA1_V2_CONTRACT = '0x60908a71fbc9027838277f9f98e458bef2a201da';
const ALPHA2_CONTRACT = '0x3C390b91Fc2f248E75Cd271e2dAbF7DcC955B1A3';

const BTCB = '0x152b9d0FdC40C096757F570A51E494bd4b943E50';
const USDC = '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E';

const ALPHA1_ABI = "uint256:totalBalance";
const ALPHA2_ABI = "uint256:getLastUpdatedModulesBalance";

async function tvl(timestamp, block, chainBlocks) {
  const balances = {};

  const alpha1V1Balance = (await sdk.api.abi.call({
    abi: ALPHA1_ABI,
    chain: 'avax',
    target: ALPHA1_V1_CONTRACT,
    params: [],
    block: chainBlocks['avax'],
  })).output;

  const alpha1V2Balance = (await sdk.api.abi.call({
    abi: ALPHA1_ABI,
    chain: 'avax',
    target: ALPHA1_V2_CONTRACT,
    params: [],
    block: chainBlocks['avax'],
  })).output;

  const alpha2Balance = (await sdk.api.abi.call({
    abi: ALPHA2_ABI,
    chain: 'avax',
    target: ALPHA2_CONTRACT,
    params: [],
    block: chainBlocks['avax'],
  })).output;

  await sdk.util.sumSingleBalance(balances, `avax:${USDC}`, alpha1V1Balance);
  await sdk.util.sumSingleBalance(balances, `avax:${USDC}`, alpha1V2Balance);
  await sdk.util.sumSingleBalance(balances, `avax:${BTCB}`, alpha2Balance);

  return balances;
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: 'Gets the total balance in the Alpha #1 contract from IOU total supply and price per share and in the Smart Farmooor (Alpha #2) from the total balance.',
  start: 21220270,
  avax: {
    tvl,
  }
};