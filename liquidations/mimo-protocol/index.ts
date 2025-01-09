import axios from "axios";
import { gql } from "graphql-request";
import BigNumber from "bignumber.js";
import { getPagedGql } from "../utils/gql";
import { Liq } from "../utils/types";
const sdk = require("@defillama/sdk");

const RATE_ACCURACY = BigNumber("1000000000000000000000000000"); // 1e27

const latestRoundDataABI = {
  inputs: [],
  name: "latestRoundData",
  outputs: [
    { internalType: "uint80", name: "roundId", type: "uint80" },
    { internalType: "int256", name: "answer", type: "int256" },
    { internalType: "uint256", name: "startedAt", type: "uint256" },
    { internalType: "uint256", name: "updatedAt", type: "uint256" },
    { internalType: "uint80", name: "answeredInRound", type: "uint80" },
  ],
  stateMutability: "view",
  type: "function",
};

enum Chain {
  ethereum = "ethereum",
  polygon = "polygon",
  // fantom = "fantom",
}

const getEURUSD = async (chain: Chain) => {
  const oracleAddresses = {
    [Chain.ethereum]: "0xb49f677943bc038e9857d61e7d053caa2c1734c1",
    [Chain.polygon]: "0x73366fe0aa0ded304479862808e02506fe556a98",
    // [Chain.fantom]: "0x3e68e68ea2c3698400465e3104843597690ae0f7",
  };

  const eurUSDRoundData = await sdk.api.abi.call({
    chain: chain,
    target: oracleAddresses[chain],
    params: [],
    abi: latestRoundDataABI,
  });

  return eurUSDRoundData.output.answer / 10 ** 8;
};

const getSubgraphUrl = (chain: Chain) => {
  let subgraphUrl: string;

  switch (chain) {
    case Chain.ethereum: {
      subgraphUrl = sdk.graph.modifyEndpoint('FV3Dw1zMs97LpVPegWZKJv4bsbsZdrob2EqLCPxdcoDS');
      break;
    }
    case Chain.polygon: {
      subgraphUrl = sdk.graph.modifyEndpoint('EfFLqiwngmmtE5su2t1EsFoEttoj8KWervocfab1ofYT');
      break;
    }
    // case Chain.fantom: {
    //   subgraphUrl =
    //     sdk.graph.modifyEndpoint('DkSQLWkkiNfeNG43NJnHsW9hfih8hDt4SHFTNMQgPHJH');
    //   break;
    // }
  }

  return subgraphUrl;
};

const vaultsQuery = gql`
  query vaults($lastId: ID, $pageSize: Int) {
    vaults(first: $pageSize, where: { id_gt: $lastId, baseDebt_gt: 0 }) {
      id
      owner {
        id
      }
      baseDebt
      collateralBalance
      collateralType
    }
  }
`;

const collateralQuery = gql`
  query collateralConfigs($lastId: ID, $pageSize: Int) {
    collateralConfigs(first: $pageSize, where: { id_gt: $lastId }) {
      id
      currentCumulativeRate
      liquidationRatio
    }
  }
`;

type VaultData = {
  id: string;
  baseDebt: string;
  collateralBalance: string;
  collateralType: string;
  owner: {
    id: string;
  };
};

type CollateralConfig = {
  id: string;
  currentCumulativeRate: string;
  liquidationRatio: string;
};

const getVaultData = async (chain: Chain) => {
  const subgraphUrl = getSubgraphUrl(chain);
  const vaultData = (await getPagedGql(
    subgraphUrl,
    vaultsQuery,
    "vaults"
  )) as VaultData[];
  return vaultData;
};

const getTokenInfo = async (tokenId: string) => {
  const info = (
    await axios.get("https://coins.llama.fi/prices/current/" + tokenId)
  ).data.coins as {
    [tokenId: string]: {
      decimals: number;
      price: number;
      symbol: string;
      timestamp: number;
      confidence: number;
    };
  };
  const price = info[tokenId];
  return price;
};

const getCollateralConfigs = async (chain: Chain) => {
  const subgraphUrl = getSubgraphUrl(chain);
  const collateralConfigsData = (await getPagedGql(
    subgraphUrl,
    collateralQuery,
    "collateralConfigs"
  )) as CollateralConfig[];

  return collateralConfigsData
    .filter(
      (value) => value.id !== "0x0000000000000000000000000000000000000001"
    ) // get rid of some faulty configs
    .reduce(async (previous, item, index, array) => {
      const result = await previous;
      result[item.id] = {
        ...item,
        tokenInfo: await getTokenInfo(`${chain}:${item.id}`),
      };
      return result;
    }, Promise.resolve({}));
};

const positions = (chain: Chain) => async (): Promise<Liq[]> => {
  const vaultData = await getVaultData(chain);
  const collateralConfigs = await getCollateralConfigs(chain);

  const eurUSD = await getEURUSD(chain);

  const positions: Liq[] = vaultData.map((data) => {
    const collateralConfig = collateralConfigs[data.collateralType];
    const currentCumulativeRate = collateralConfig.currentCumulativeRate;
    const vaultDebt = BigNumber(currentCumulativeRate)
      .times(BigNumber(data.baseDebt))
      .div(RATE_ACCURACY)
      .div(10 ** 18); // debt is always in PAR, and PAR is 18 decimals

    const accuracy = BigNumber(10 ** collateralConfig.tokenInfo.decimals);
    const liqPriceInPAR = vaultDebt
      .times(accuracy)
      .times(BigNumber(collateralConfig.liquidationRatio))
      .div(BigNumber(data.collateralBalance))
      .div(BigNumber(10 ** 18));
    const liqPrice = liqPriceInPAR.times(eurUSD);

    return {
      owner: data.owner.id,
      liqPrice: liqPrice.toNumber(),
      collateral: `${chain}:${data.collateralType}`,
      collateralAmount: data.collateralBalance,
    };
  });

  return positions.filter((position) => position.liqPrice > 0);
};

module.exports = {
  ethereum: {
    liquidations: positions(Chain.ethereum),
  },
  polygon: {
    liquidations: positions(Chain.polygon),
  },
  // fantom: {
  //   liquidations: positions(Chain.fantom),
  // },
};
