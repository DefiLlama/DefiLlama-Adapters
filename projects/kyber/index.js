const sdk = require("@defillama/sdk")
const { cachedGraphQuery } = require("../helper/cache");
const { sumTokens2 } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json');


const KYBER_STAKING_ADDRESS = "0xECf0bdB7B3F349AbfD68C3563678124c5e8aaea3";
const KYBER_STAKING_ADDRESS_2 = "0xeadb96F1623176144EBa2B24e35325220972b3bD";
const KNC = "0xdd974d5c2e2928dea5f71b9825b8b646686bd200";
const KNC_V2 = "0xdeFA4e8a7bcBA345F687a2f1456F5Edd9CE97202";
const UNISWAP_KNC = "0x49c4f9bc14884f6210F28342ceD592A633801a8b";
const UNISWAP_KNC_V2 = "0xf49C43Ae0fAf37217bDcB00DF478cF793eDd6687";
const UNISWAP_KNC_V3 = "0x32263442a49650D89B2AB3dCB46B8C8DeC612F4D";
const KYBER_AGGREGATOR = "0x6E4141d33021b52C91c28608403db4A0FFB50Ec6";
const KYBER_META_AGGREGATION_ROUTER_V2 = "0x6131b5fae19ea4f9d964eac0408e4408b66337b5";
const KYBER_AGGREGATION_ROUTER_V2 = "0xdf1a1b60f2d438842916c0adc43748768353ec25";

const CONFIG = {
  ethereum: {
    graphId: "mainnet",
    owners: [ KYBER_META_AGGREGATION_ROUTER_V2 ],
    tokens: [ ADDRESSES.ethereum.WETH, ADDRESSES.null, ADDRESSES.ethereum.USDC, ADDRESSES.ethereum.USDT ],
    staking: sumTokens2.bind(null, {
      owners: [ KYBER_STAKING_ADDRESS, KYBER_STAKING_ADDRESS_2 ],
      tokens: [
        KNC,
        KNC_V2
      ],
      chain: 'ethereum'
    })
  },
  arbitrum: { graphId: "arbitrum-one", blacklistedTokens: [ '0x0df5dfd95966753f01cb80e76dc20ea958238c46' ] }, // rWETH
  polygon: { graphId: "matic" },
  avax: { graphId: "avalanche" },
  bsc: {
    graphId: "bsc",
  },
  fantom: { graphId: "fantom" },
  cronos: { graphId: "cronos" },
  optimism: { graphId: "optimism" },
  linea: {
    graphId: 'linea',
    owners: [ KYBER_META_AGGREGATION_ROUTER_V2 ],
    tokens: [ ADDRESSES.linea.WETH, ADDRESSES.null, ADDRESSES.linea.USDC, ADDRESSES.linea.USDT, ADDRESSES.linea.BNB ],
  },
  base: {
    // graphId: 'base', // not using standard subgraph due to issues
    owners: [ KYBER_META_AGGREGATION_ROUTER_V2 ],
    tokens: [ ADDRESSES.base.WETH, ADDRESSES.null, ADDRESSES.base.USDC, ADDRESSES.base.USDT ],
  },
  scroll: { graphId: 'scroll' },
};

async function fetchPools(chain) {
  const url = getGraphUrl(chain);
  let toa = [];
  const poolQuery = `
    query pools($lastId: String) {
      pools(first: 1000, where: {id_gt: $lastId} ) {
        id
        token0 {
          id
        }
        token1 {
          id
        }
      }
    }`;
  const pools = await cachedGraphQuery('kyber/' + chain, url, poolQuery, { fetchById: true, })
  console.debug('pools', pools.length)
  pools.forEach?.(({ id, token0, token1 }) => {
    toa.push([ token0.id, id ])
    toa.push([ token1.id, id ])
  })

  return toa;
}

function getGraphUrl(chain) {
  let url;

  switch (chain) {
    case "linea": url = 'https://graph-query.linea.build/subgraphs/name/kybernetwork/kyberswap-elastic-linea'; break;
    case "cronos": url = 'https://cronos-graph.kyberengineering.io/subgraphs/name/kybernetwork/kyberswap-elastic-cronos'; break;
    case "base": url = 'https://base-graph.kyberengineering.io/subgraphs/name/kybernetwork/kyberswap-elastic-base'; break;
    case "scroll": url = 'https://scroll-graph.kyberengineering.io/subgraphs/name/kybernetwork/kyberswap-elastic-scroll'; break;
    case "mainnet": url = sdk.graph.modifyEndpoint('4U9PxDR4asVvfXyoVy18fhuj6NHnQhLzZkjZ5Bmuc5xk'); break;
    case "polygon": url = sdk.graph.modifyEndpoint('BcBYReG6ZKkrXrnZUqvTqjQGURg4vBMimEJm7TZFi4qV'); break;
    case "arbitrum-one": url = sdk.graph.modifyEndpoint('C36tj8jSpEHxcNbjM3z7ayUZHVjrk4HRqnpGMFuRgXs6'); break;
    case "avalanche": url = sdk.graph.modifyEndpoint('9oMJfc7CL8uDqqQ3T3NFBnFCz9JMwq2YhH9AqojECFWp'); break;
    case "bsc": url = sdk.graph.modifyEndpoint('FDEDgycFnTbPZ7PfrnWEZ4iR7T5De6BR69zx1i8gKQRa'); break;
    case "fantom": url = sdk.graph.modifyEndpoint('9aj6YZFVL647wFBQXnNKM72eiowP4fyzynQKwLrn5axL'); break;
    case "optimism": url = sdk.graph.modifyEndpoint('3Kpd8i7U94pTz3Mgdb8hyvT5o26fpwT7SUHAbTa6JzfZ'); break;
    default: url = `https://api.thegraph.com/subgraphs/name/kybernetwork/kyberswap-elastic-${chain}`;
  }
  return url;
}

function tvl(config) {
  const { graphId, blacklistedTokens = [], owners, tokens } = config;
  return async (api) => {
    const pools = graphId && await fetchPools(graphId) || []
    return sumTokens2({
      api,
      tokensAndOwners: pools,
      tokens,
      owners,
      blacklistedTokens
    })
  }
}

module.exports = {
  timetravel: false,
  methodology: `TVL is calculated by querying KyberSwap's subgraphs to get all liquidity pools and summing the balances of all tokens held in these pools. It also includes tokens held in Kyber's Meta Aggregation Router contracts on specified chains.`,
  hallmarks: [
    [ '2023-04-17', 'Kyber team identified a vuln' ],
    // [1700611200,'Protocol exploit'],
  ],
};

Object.keys(CONFIG).forEach((chain) => {
  const config = CONFIG[ chain ]
  module.exports[ chain ] = {
    tvl: tvl(config),
    staking: config?.staking || (() => ({})),
  }
})