const { request, gql } = require("graphql-request");
const sdk = require('@defillama/sdk');
const { sumTokens } = require("../helper/unwrapLPs");
const { requery } = require("../helper/requery");

const endpoint = 'https://api.thegraph.com/subgraphs/name/umaprotocol/mainnet-contracts'
const query = gql`
query get_tvl($block: Int) {
  financialContracts(
    block: { number: $block }
  ) {
    address
    collateralToken{
      address
    }
  }
}
`;

const abi = {
  inputs: [],
  name: "collateralCurrency",
  outputs: [
    {
      internalType: "contract IERC20",
      name: "",
      type: "address",
    },
  ],
  stateMutability: "view",
  type: "function",
}

async function tvl(timestamp, block) {
  const balances = {};
  const logs = await sdk.api.util.getLogs({
    target: '0x3e532e6222afe9Bcf02DCB87216802c75D5113aE',
    topic: 'NewContractRegistered(address,address,address[])',
    keys: ['topics'],
    fromBlock: 9937650,
    toBlock: block
  })
  const collaterals = await sdk.api.abi.multiCall({
    calls: logs.output.map(poolLog=>({
      target:`0x${poolLog[1].slice(26)}`
    })),
    block,
    abi
  })
  await requery(collaterals, 'ethereum', block, abi)
  await sumTokens(balances, collaterals.output.filter(t=>t.output !== null).map(c=>[
    c.output, c.input.target
  ]), block)

  return balances;
}

module.exports = {
  tvl
}
