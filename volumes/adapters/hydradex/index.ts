import request, { gql, GraphQLClient } from "graphql-request";
import { SimpleVolumeAdapter } from "../../dexVolume.type";
import { CHAIN } from "../../helper/chains";
import { getUniqStartOfTodayTimestamp } from "../../helper/getUniSubgraphVolume";


const URL = "https://info.hydradex.org/graphql";
const blockQuery = gql`
  query blocks($timestampFrom: Int!, $timestampTo: Int!) {
    blocks(first: 1, orderBy: "timestamp", orderDirection: "asc", where: {timestamp_gt: $timestampFrom, timestamp_lt: $timestampTo}) {
      id
      number
      timestamp
    }
  }
`;

const DAY_IN_SECONDS = 60 * 60 * 24
const getCustomBlock = async (timestamp: number) => {
  const value = {
    timestampFrom: timestamp - DAY_IN_SECONDS,
    timestampTo: timestamp + DAY_IN_SECONDS,
  }
  const block = Number(
    (
      await request(URL, blockQuery, value)
    ).blocks[0].number
  );

  return block;
};

const hydraswapFactories = (block) => {
  return gql`query Query {
    hydraswapFactories(block: {number: ${block}}, where: {id: "5a2a927bea6c5f4a48d4e0116049c1e36d52a528"}) {
      id
      totalVolumeUSD
  }
}
`}
const hydraswapDayDatas = () => {
  return gql`
  query hydraswapDayDatas($startTime: Int!, $skip: Int!) {
    hydraswapDayDatas(first: 1000, skip: $skip, where: {date_gt: $startTime}, orderBy: "date", orderDirection: "asc") {
      id
      date
      dailyVolumeUSD
    }
  }
  `
}


const graphQLClient = new GraphQLClient(URL);
const getGQLClient = () => {
  return graphQLClient
}

interface IGraphResponseFactories {
  hydraswapFactories: Array<{
    totalVolumeUSD: number,
  }>
}
interface IGraphResponseHydraswapDayDatas {
  hydraswapDayDatas: Array<{
    date: number,
    dailyVolumeUSD: number,
  }>
}

const fetch = async (timestamp: number) => {
  const block = await getCustomBlock(timestamp);
  const dayTimestamp = getUniqStartOfTodayTimestamp(new Date(timestamp * 1000));
  const totalVolumes: IGraphResponseFactories = (await getGQLClient().request(hydraswapFactories(block)));
  const dailyVolumes: IGraphResponseHydraswapDayDatas = (await getGQLClient().request(hydraswapDayDatas(), {startTime: 1633391998, skip: 0}));

  const totalVolume = totalVolumes.hydraswapFactories
    .reduce((acc, { totalVolumeUSD }) => acc + Number(totalVolumeUSD), 0);

  const dailyVolume = dailyVolumes.hydraswapDayDatas
    .find(dayItem => dayItem.date === dayTimestamp)?.dailyVolumeUSD

  return {
    timestamp: dayTimestamp,
    dailyVolume: dailyVolume.toString(),
    totalVolume: totalVolume.toString(),
  }
}

const adapter: SimpleVolumeAdapter = {
  volume: {
    [CHAIN.HYDRA]: {
      fetch: fetch,
      start: async () => 1633391998,
    },
  },
};

export default adapter;
