const chainId = {
  metis: 1088,
  kava: 2222,
  era: 324,
  fantom: 250,
  ethereum: 1,
};

const chainNames = {
  [chainId.kava]: "kava",
  [chainId.metis]: "metis",
  [chainId.era]: "era",
  [chainId.fantom]: "fantom",
  [chainId.ethereum]: "ethereum",
};

const SWAGMI_GRAPH = {
  [chainId.kava]: "https://kava.graph.wagmi.com/subgraphs/name/swagmi",
  [chainId.metis]: "https://metis.graph.wagmi.com/subgraphs/name/swagmi",
};

const SWAGMI_ADDRESSES = {
  [chainId.kava]: "0x3690d1a9fb569c21372f8091527ab44f1dc9630f",
  [chainId.metis]: "0x5fb3983adc4dcc82a610a91d2e329f6401352558",
};

const WAGMI_GRAPH = {
  [chainId.kava]: "https://kava.graph.wagmi.com/subgraphs/name/v3",
};

const WAGMI_ADDRESSES = {
  [chainId.kava]: "0xaf20f5f19698f1d19351028cd7103b63d30de7d7",
  [chainId.metis]: "0xaf20f5f19698f1d19351028cd7103b63d30de7d7",
};

const query = `
  query stats($startTimestamp: Int!, $endTimestamp: Int!) {
      sWagmiDayDatas(first: 1000, subgraphError: allow, where: { date_gt: $startTimestamp, date_lte: $endTimestamp }, orderBy: date, orderDirection: asc) {
        id
        date
        totalValueLocked
    }
  }
`;

const poolQuery = `
  query poolQuery($lastId: String) {
    pools(first:1000 where: {id_gt: $lastId totalValueLockedUSD_gt: 0}) {
      id
      token0 { id }
      token1 { id }
    }
  }
`;

const sWagmiSupportedChains = [chainId.kava, chainId.metis];

module.exports = {
  chainId,
  chainNames,
  SWAGMI_GRAPH,
  SWAGMI_ADDRESSES,
  WAGMI_GRAPH,
  WAGMI_ADDRESSES,
  query,
  poolQuery,
  sWagmiSupportedChains,
};
