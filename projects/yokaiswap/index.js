const { GraphQLClient, gql } = require("graphql-request");
const { toUSDTBalances } = require("../helper/balances");
const { getUniTVL, sumTokensExport } = require('../helper/unknownTokens')
const sdk = require('@defillama/sdk')
const axios = require("axios");

async function fetch() {
  const endpoint =
    "https://v0.yokaiswap.com/subgraphs/name/yokaiswap/exchange";
  const graphQLClient = new GraphQLClient(endpoint);

  const query = gql`
    query yokaiFactories {
      yokaiFactories {
        totalLiquidityUSD
      }
    }
  `;

  const data = await graphQLClient.request(query);

  return toUSDTBalances(data.yokaiFactories[0].totalLiquidityUSD);
}

const getReservesABI = 'function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)'

// had to be disabled till we get multicall working
const tvl_v0 = getUniTVL({ chain: 'godwoken', factory: '0x5ef0d2d41a5f3d5a083bc776f94282667c27b794', useDefaultCoreAssets: false,  abis: { getReserves: getReservesABI }})
const tvl_v1 = getUniTVL({ chain: 'godwoken_v1', factory: '0x7ec2d60880d83614dd4013D39CF273107f30624c', useDefaultCoreAssets: true, })

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: `Finds TotalLiquidityUSD using the YokaiSwap subgraph "https://www.yokaiswap.com/subgraphs/name/yokaiswap/exchange". Staking accounts for the YOK locked in MasterChef (0x62493bFa183bB6CcD4b4e856230CF72f68299469).`,
  godwoken: {
    tvl: fetch,
    //staking,
  },
  godwoken_v1: {
    tvl: tvl_v1,
    staking: sumTokensExport({ chain: 'godwoken_v1', owner: '0xbf7b7295f84b4bd2de9d549d047e51c7917dc5e3', tokens: ['0x885fb612947ccF1C7611894Bd828D388b046fc24'], lps: ['0xbf7b7295f84b4bd2de9d549d047e51c7917dc5e3'], useDefaultCoreAssets: true })
  },
  hallmarks: [
    [Math.floor(new Date('2022-08-26')/1e3), "Add godwoken v1 chain tvl"],
  ],
};
