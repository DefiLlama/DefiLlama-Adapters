const BigNumber = require('bignumber.js');
const { request, gql } = require('graphql-request');
const axios = require('axios');
const {getApiTvl} = require('./helper/historicalApi');

/*
const BASE_URL = 'https://api.subquery.network/sq/sora-xor/sora';
const XOR_ASSET_ID = '0x0200000000000000000000000000000000000000000000000000000000000000';
const POOL_XYK_ENTITIES = gql`
query PoolXYKEntities (
  $first: Int = 1)
{
  poolXYKEntities (
    first: $first
  )
  {
    nodes {
      pools {
        edges {
          node {
            targetAssetId,
            priceUSD,
            baseAssetReserves,
            targetAssetReserves
          }
        }
      }
    }
  }
}`;

async function fetch () {
  try {
    const { poolXYKEntities } = await request(BASE_URL, POOL_XYK_ENTITIES, {});
    if (!poolXYKEntities) {
      throw new Error('SORA adapter: Something was happened with SORA requested data!');
    }
    const data = poolXYKEntities.nodes[0].pools.edges.map(item => item.node);
    if (!data || !data.length) {
      throw new Error('SORA adapter: Something was happened with SORA requested data!');
    }
    const xor = data.find(item => item.targetAssetId === XOR_ASSET_ID);
    const xorPriceUSD = new BigNumber(xor.priceUSD);

    const tvl = data.reduce((acc, item) => {
      if (item.targetAssetId === XOR_ASSET_ID) {
        return acc; // XOR-XOR pair
      }
      const priceUSD = new BigNumber(item.priceUSD);
      const baseAssetReserves = new BigNumber(item.baseAssetReserves);
      const targetAssetReserves = new BigNumber(item.targetAssetReserves);
      // x += (xorReserves * xorPrice + targetAssetReserves * targetAssetPriceUSD)
      return acc.plus(baseAssetReserves.times(xorPriceUSD).plus(targetAssetReserves.times(priceUSD)));
    }, new BigNumber(0));

    return tvl.toNumber();
  } catch (error) {
    throw new Error('SORA adapter: Something was happened with SORA subquery connection!');
  }
}
*/

const getData = async ()=>{
  const data = await axios.post("https://polkaview.io:8086/api/v2/query?org=PolkaCloud", {
    "query": "from(bucket: \"polkaswap_platform\")  |> range(start: -600d, stop: now())  |> filter(fn: (r) => r[\"_measurement\"] == \"tvl_USD\" and r[\"_field\"] == \"value\")  |> aggregateWindow(every: 60m, fn: last, createEmpty: false)  |> yield(name: \"last\")",
    "dialect": {
      "header": true,
      "delimiter": ",",
      "quoteChar": "\"",
      "commentPrefix": "#",
      "annotations": [
        "datatype",
        "group",
        "default"
      ]
    },
    "type": "flux"
  }, {
    headers: {
      "authorization": "Token C2IS7BxyTxbxLGU75byPIy3eYn95xtcZdOEV6ap_Kp0pXMv4fKrCWIMHrFD8hg0Tlv44QJlH25asvlthauOXXA=="
    }
  })
  const parsed = data.data.split("\n").slice(4, -2).map(row=>{
    const els = row.split(',')
    return {
      date: new Date(els[5]).getTime()/1000,
      totalLiquidityUSD: Number(els[6])
    }
  })
  return parsed
}

async function tvl(timestamp) {
  return getApiTvl(timestamp, async()=>{
    const data = await getData()
    return data[data.length-1].totalLiquidityUSD
  }, getData)
}

module.exports = {
  methodology: "All pools from https://polkaswap.io launched on SORA network are included in TVL. Data comes from https://polkaview.io",
  tvl,
};
