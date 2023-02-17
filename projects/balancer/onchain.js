const sdk = require('@defillama/sdk');

const { request, gql } = require("graphql-request");
const { transformArbitrumAddress } = require('../helper/portedTokens')
const { requery } = require('../helper/requery')
const { getLogs } = require('../helper/cache/getLogs')

const abi = require('./abi');
const ignored = ["0xC011A72400E58ecD99Ee497CF89E3775d4bd732F", "0x57Ab1E02fEE23774580C119740129eAC7081e9D3", // old synthetix
//self destructed
"0x00f109f744B5C918b13d4e6a834887Eb7d651535", "0x645F7dd67479663EE7a42feFEC2E55A857cb1833", "0x4922a015c4407F87432B179bb209e125432E4a2A",
"0xdA16D6F08F20249376d01a09FEBbAd395a246b2C", "0x9be4f6a2558f88A82b46947e3703528919CE6414",

// pool tokens
"0x05f21bacc4fd8590d1eaca9830a64b66a733316c", "0x089443665084fc50aa6f1d0dc0307333fd481b85", "0x02d2e2d7a89d6c5cb3681cfcb6f7dac02a55eda4",
"0xfb5e6d0c1dfed2ba000fbc040ab8df3615ac329c",
"0xa13a9247ea42d743238089903570127dda72fe44", // eth bb-a-USD
]

const V2_ADDRESS = '0xBA12222222228d8Ba445958a75a0704d566BF2C8'; // shared by all networks
const subgraphs = {
  ethereum: 'balancer-v2',
  arbitrum: 'balancer-arbitrum-v2',
  polygon: 'balancer-polygon-v2'
}

async function v1(timestamp, block, _, { api, }) {
  let balances = {
    '0x0000000000000000000000000000000000000000': '0', // ETH
  };

  let poolLogs = await getLogs({
    target: '0x9424B1412450D0f8Fc2255FAf6046b98213B76Bd',
    topic: 'LOG_NEW_POOL(address,address)',
    fromBlock: 9562480,
    api,
  });

  let poolCalls = [];

  let pools = poolLogs.map((poolLog) => {
    if (poolLog.topics) {
      return `0x${poolLog.topics[2].slice(26)}`
    } else {
      return `0x${poolLog[2].slice(26)}`
    }
  });

  const poolTokenData = (await sdk.api.abi.multiCall({
    calls: pools.map((poolAddress) => ({ target: poolAddress })),
    abi: abi.getCurrentTokens,
  })).output;

  poolTokenData.forEach((poolToken) => {
    let poolTokens = poolToken.output;
    let poolAddress = poolToken.input.target;

    poolTokens.forEach((token) => {
      if(ignored.includes(token)){
        return
      }
      poolCalls.push({
        target: token,
        params: poolAddress,
      });
    })
  });

  let poolBalances = await sdk.api.abi.multiCall({
    block,
    calls: poolCalls,
    abi: 'erc20:balanceOf'
  });

  sdk.util.sumMultiBalanceOf(balances, poolBalances)
  return balances
}

function v2(chain) {
  return async (time, ethBlock, chainBlocks) => {
    const block = chainBlocks[chain]
    const balances = {}
    const tokensApi = `https://api.thegraph.com/subgraphs/name/balancer-labs/${subgraphs[chain]}`;
    const POOL_TOKENS = gql`
      {
        balancers {
          pools {
            tokens {
              address
            }
          }
        }
      }`;

    const v2Tokens = await request(tokensApi, POOL_TOKENS, {
      block,
    });
    let tokenAddresses = [];
    for (let i = 0; i < v2Tokens.balancers[0].pools.length; i++) {
      for (let address of v2Tokens.balancers[0].pools[i].tokens) {
        if(!ignored.includes(address.address)){
          tokenAddresses.push(address.address)
        }
      }
    }
    tokenAddresses = [...new Set(tokenAddresses)]

    let v2Calls = tokenAddresses.map((address) => {
      return {
        target: address,
        params: V2_ADDRESS
      }
    });
    let v2Balances = await sdk.api.abi.multiCall({
      block,
      calls: v2Calls,
      abi: 'erc20:balanceOf'
    });
    await requery(v2Balances, chain, block, "erc20:balanceOf")
    let transform = addr => `${chain}:${addr}`
    sdk.util.sumMultiBalanceOf(balances, v2Balances, true, transform)

    return balances;
  }
}

module.exports = {
  polygon:{
    tvl:  v2("polygon")
  },
  arbitrum:{
    tvl: v2("arbitrum")
  },
  ethereum:{
    tvl: sdk.util.sumChainTvls([v1, v2("ethereum")])
  }
}
