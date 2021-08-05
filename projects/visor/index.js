const sdk = require("@defillama/sdk");
const hypervisorAbi = require('./abis/hypervisor.json')
const { unwrapUniswapLPs } = require('../helper/unwrapLPs')
const { request, gql } = require("graphql-request");

const BigNumber = require('bignumber.js');
const getTotalAmounts = require('./abis/getTotalAmounts.json');

//get their pool addresses from the subgraph
const graphUrl =
  'https://api.thegraph.com/subgraphs/name/visorfinance/visor';

const graphQuery = gql` 
{
  hypervisors(first: 10){
    id
    stakingToken{
      id
      symbol
    }
    totalStakedAmount
  }
}
`;

const uniV3HypervisorQuery = gql` 
{
  uniswapV3Hypervisors(first: 1000){
    id
    pool{
      token0{
        id
      }
      token1{
        id
      }
    }
  }
}
`;


async function tvl(timestamp, block) {

  // Set ETH placeholder in balances
  const ethAddress = '0x0000000000000000000000000000000000000000';
  let balances = {
    [ethAddress]: '0', // ETH
  };

  const tvls = await Promise.all([
    tvlLiquidityMining(timestamp, block),
    tvlUniV3(timestamp, block),
  ]);

  for (currTvl of tvls){
    for (let [token, amount] of Object.entries(currTvl)) {
      balances[token] = BigNumber(balances[token] || 0).plus(amount).toFixed()
    }
  }

  return balances;
}

/*Tokens staked in Visors*/
async function tvlLiquidityMining(timestamp, block) {
  const balances = {};

  //get the staking pool contracts, and the respective token addresses
  const resp = await request(
    graphUrl,
    graphQuery
  );

  for (i = 0; i < resp.hypervisors.length; i++) {
    const curr = resp.hypervisors[i];
    const stakingPoolAddr = curr.id;
    const tokenAddr = curr.stakingToken.id;

    const tokenLocked = await sdk.api.abi.call({
      target: stakingPoolAddr,
      abi: hypervisorAbi["getHyperVisorData"],
      block: block
    });

    if (curr.stakingToken.symbol == 'UNI-V2') {
      await unwrapUniswapLPs(balances, [{
        token: tokenAddr,
        balance: tokenLocked.output.totalStake,
      }], block)
    }
    else {
      balances[tokenAddr] = tokenLocked.output.totalStake
    }
  }

  return balances;
}

/*Tokens deposited in Uniswap V3 positions managed by Visor*/
async function tvlUniV3(timestamp, block) {
  const balances = {};

  // One off hypervisors that are not created from the main factory
  const standaloneHypervisors = [
    {
        'address': '0x9a98bFfAbc0ABf291d6811C034E239e916bBceC0',  // ETH-USDT
        'token0': '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',   // WETH
        'token1': '0xdAC17F958D2ee523a2206206994597C13D831ec7',   // USDT
        'fromBlock': 12590301,
        'toBlock': block,
    }
  ]

  // const logs = (
  //   await sdk.api.util.getLogs({
  //     keys: ['topics', 'data'],
  //     toBlock: block,
  //     target: '0xC878c38F0Df509a833D10De892e1Cf7D361e3A67',
  //     fromBlock: 12615883,
  //     topic: 'HypervisorCreated(address,address,uint24,address,uint256)',
  //   })
  // ).output
  const resp = await request(
    graphUrl,
    uniV3HypervisorQuery
  );

  const hypervisorAddresses = []
  const token0Addresses = []
  const token1Addresses = []

  for (let hypervisor of resp.uniswapV3Hypervisors) {
    token0Addresses.push(hypervisor.pool.token0.id.toLowerCase())
    token1Addresses.push(hypervisor.pool.token1.id.toLowerCase())
    hypervisorAddresses.push(hypervisor.id.toLowerCase())
  }

  // Add standalone hypervisors
  for (let standaloneHypervisor of standaloneHypervisors) {
    if (block >= standaloneHypervisor.fromBlock && block <= standaloneHypervisor.toBlock) {
      token0Addresses.push(standaloneHypervisor.token0.toLowerCase())
      token1Addresses.push(standaloneHypervisor.token1.toLowerCase())
      hypervisorAddresses.push(standaloneHypervisor.address.toLowerCase())
    }
  }

  const hypervisors = {}
  // add token0Addresses
  token0Addresses.forEach((token0Address, i) => {
    const hypervisorAddress = hypervisorAddresses[i]
    hypervisors[hypervisorAddress] = {
      token0Address: token0Address
    }
  })

  // add token1Addresses
  token1Addresses.forEach((token1Address, i) => {
    const hypervisorAddress = hypervisorAddresses[i]
    hypervisors[hypervisorAddress] = {
      ...(hypervisors[hypervisorAddress] || {}),
      token1Address: token1Address,
    }
  })

  let hypervisorCalls = []

  for (let hypervisor of Object.keys(hypervisors)) {
    hypervisorCalls.push({
      target: hypervisor
    })
  }

  // Call getTotalAmounts on hypervisor contract
  const hypervisorBalances = (
    await sdk.api.abi.multiCall({
      abi: getTotalAmounts,
      calls: hypervisorCalls,
      block,
    })
  )

  // Sum up balance0 and balance1 for each hypervisor
  for (let balance of hypervisorBalances.output) {
    if (balance.success) {
      let hypervisorAddress = balance.input.target
      let address0 = hypervisors[hypervisorAddress].token0Address
      let address1 = hypervisors[hypervisorAddress].token1Address
      let balance0 = balance.output.total0
      let balance1 = balance.output.total1

      balances[address0] = BigNumber(balances[address0] || 0).plus(balance0).toFixed()
      balances[address1] = BigNumber(balances[address1] || 0).plus(balance1).toFixed()
    }
  }

  return balances;
}

module.exports = {
  name: 'Visor',               // project name
  website: 'https://www.visor.finance/',
  token: 'VISR',
  category: 'Other',          // Lending
  start: 1616679762,            // (Mar-25-2021 01:42:42 PM +UTC)
  tvl                           // tvl adapter
}
