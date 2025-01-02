import axios from "axios";
import { gql } from "graphql-request";
import { ethers } from "ethers";
import { providers } from "../utils/ethers";
import BigNumber from "bignumber.js";
import { getPagedGql } from "../utils/gql";
import { Liq } from "../utils/types";

enum Chain {
  ethereum = "ethereum",
  polygon = "polygon",
  optimism = "optimism",
  arbitrum = "arbitrum",
}

const getSubgraphUrl = (chain: Chain) => {
  let subgraphUrl: string;
  if (chain === Chain.ethereum) {
    subgraphUrl = "https://api.thegraph.com/subgraphs/name/picodes/borrow";
  } else {
    subgraphUrl = "https://api.thegraph.com/subgraphs/name/picodes/" + chain + "-borrow";
  }
  return subgraphUrl;
};

const vaultDataQuery = gql`
  query vaultDatas($lastId: ID, $pageSize: Int) {
    vaultDatas(first: $pageSize, where: { isActive: true, id_gt: $lastId }) {
      id
      collateralAmount
      vaultManager {
        agToken
        collateral
        collateralFactor
      }
      owner
    }
  }
`;

type VaultData = {
  id: string;
  collateralAmount: string;
  vaultManager: {
    agToken: string;
    collateral: string;
    collateralFactor: string;
  };
  owner: string;
};

const getVaultData = async (chain: Chain) => {
  const subgraphUrl = getSubgraphUrl(chain);
  const vaultData = (await getPagedGql(subgraphUrl, vaultDataQuery, "vaultDatas")) as VaultData[];
  return vaultData;
};

const getTokenInfo = async (tokenId: string) => {
  const info = (await axios.get("https://coins.llama.fi/prices/current/" + tokenId)).data.coins as {
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

const AGEUR_TOKEN_ID = "ethereum:0x1a7e4e63778B4f12a199C062f3eFdD288afCBce8";

// returns vault agEUR debt in $
const getVaultDebt = async (id: string, chain: Chain) => {
  const vaultManager = id.split("_")[0];
  const vaultId = id.split("_")[1];
  const vaultManagerContract = new ethers.Contract(
    vaultManager,
    ["function getVaultDebt(uint256) view returns (uint256)"],
    providers[chain]
  );
  const vaultDebtRaw = BigNumber((await vaultManagerContract.getVaultDebt(vaultId)).toString());
  // convert vault debt to $
  const vaultDebt = vaultDebtRaw.times((await getTokenInfo(AGEUR_TOKEN_ID)).price);
  return vaultDebt;
};

const explorers: { [key: string]: string } = {
  ethereum: "https://etherscan.io/",
  polygon: "https://polygonscan.com/",
  optimism: "https://optimistic.etherscan.io/",
  arbitrum: "https://arbiscan.io/",
};

const positions = (chain: Chain) => async () => {
  const vaultData = await getVaultData(chain);

  const positions: Liq[] = [];
  for (const vault of vaultData) {
    const owner = vault.owner;
    const collateral = vault.vaultManager.collateral;
    const collateralAmount = vault.collateralAmount;

    // liquidation price computation
    const vaultDebt = await getVaultDebt(vault.id, chain);
    const collateralFactor = BigNumber(vault.vaultManager.collateralFactor).div(10e8);
    let liqPrice: number;

    const collateralDecimals = (await getTokenInfo(chain + ":" + collateral)).decimals;
    if (collateralDecimals != 18) {
      // correcting the number of decimals
      liqPrice = BigNumber(vaultDebt)
        .div(BigNumber(collateralAmount).times(collateralFactor))
        .times(10 ** (collateralDecimals - 18))
        .toNumber();
    } else {
      liqPrice = BigNumber(vaultDebt).div(BigNumber(collateralAmount).times(collateralFactor)).toNumber();
    }

    positions.push({
      owner,
      liqPrice,
      collateral: chain + ":" + collateral,
      collateralAmount,
      extra: {
        url: explorers[chain] + "address/" + owner,
      },
    });
  }

  return positions.filter((position) => position.liqPrice > 0);
};

module.exports = {
  ethereum: {
    liquidations: positions(Chain.ethereum),
  },
  // polygon: {
  //   liquidations: positions(Chain.polygon),
  // },
  // optimism: {
  //   liquidations: positions(Chain.optimism),
  // },
  arbitrum: {
    liquidations: positions(Chain.arbitrum),
  },
};
