const sdk = require("@defillama/sdk")
const { pool2 } = require("../helper/pool2");
const { stakings } = require("../helper/staking");
const { getCompoundV2Tvl } = require("../helper/compound");

const ALPHA1_CONTRACT = '0xdE4133f0CFA1a61Ba94EC64b6fEde4acC1fE929E';
const USDC = '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E'

const abi = {
  inputs: [],
  name: "totalBalance",
  outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
  stateMutability: "view",
  type: "function"
};

async function tvl(timestamp, block, chainBlocks) {
  const balances = {};

  const totalBalance = (await sdk.api.abi.call({
    abi: abi,
    chain: 'avax',
    target: ALPHA1_CONTRACT,
    params: [],
    block: chainBlocks['avax'],
  })).output;

  await sdk.util.sumSingleBalance(balances, `avax:${USDC}`, totalBalance)

  return balances;
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: 'Gets the total balance in the Alpha #1 contract from IOU total supply and price per share.',
  start: 21220270,
  avax: {
    tvl,
  }
};