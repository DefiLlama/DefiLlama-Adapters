import axios from "axios";
import { gql, request } from "graphql-request";
import { ethers } from "ethers";
import { providers } from "../utils/ethers";
import BigNumber from "bignumber.js";
import { getPagedGql } from "../utils/gql";

const subgraphUrl = "https://api.thegraph.com/subgraphs/name/picodes/borrow";

const vaultDataQuery = gql`
query vaultDatas {
    vaultDatas(where: {isActive: true}) {
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
    collateralAmount: BigNumber;
    vaultManager: {
        agToken: string;
        collateral: string;
        collateralFactor: BigNumber;
    }
};


const getVaultData = async () => {
    const vaultData = (await getPagedGql(subgraphUrl, vaultDataQuery, "vaultDatas")) as VaultData[];
    return vaultData;
};

const getTokenInfo = async (address: string) => {
  const info = (
    await axios.post("https://coins.llama.fi/prices", {
      coins: ["ethereum:" + address],
    })
  ).data.coins as {
    [address: string]: { decimals: number; price: number; symbol: string; timestamp: number };
  };
  const price = info["ethereum:" + address.toLowerCase()]
  return price
} 

// returns vault agEUR debt in $
const getVaultDebt = async (id: string) => {
  const vaultManager = id.split("_")[0]
  const vaultId = id.split("_")[1]
  const vaultManagerContract = new ethers.Contract(
    vaultManager,
    ["function getVaultDebt(uint256) view returns (uint256)"],
    providers.ethereum
  );
  const vaultDebtRaw = (await vaultManagerContract.getVaultDebt(vaultId));
  // convert vault debt to $
  const vaultDebt = (await (await getTokenInfo('0x1a7e4e63778B4f12a199C062f3eFdD288afCBce8')).price * vaultDebtRaw); 
  return vaultDebt.toString();
}

const EXPLORER_BASE_URL = "https://etherscan.io/address/"

const positions = async () => {
  const vaultData: any[] = await getVaultData();

  const positions : {owner: string, liquidationPrice: number, collateral: string, collateralAmount: string, extra: any}[] = [];
  for (const vault of vaultData) {
    const owner = vault.owner;
    const collateral = vault.vaultManager.collateral;
    const collateralAmount = vault.collateralAmount;

    // liquidation price computation
    const vaultDebt = await getVaultDebt(vault.id);
    const collateralFactor = parseFloat(vault.vaultManager.collateralFactor) / 10e8
    let liquidationPrice: number

    const collateralDecimals = await (await getTokenInfo(collateral)).decimals
    if (collateralDecimals != 18) {
      // correcting the number of decimals
      liquidationPrice = (parseFloat(vaultDebt) / (parseFloat(collateralAmount)*collateralFactor)) * (10 ** (collateralDecimals - 18))
    } else {
      liquidationPrice = parseFloat(vaultDebt) / (parseFloat(collateralAmount)*collateralFactor)
    }

    positions.push({
      owner: owner, 
      liquidationPrice: liquidationPrice,
      collateral: "ethereum:" + collateral, 
      collateralAmount: collateralAmount, 
      extra: {
        url: EXPLORER_BASE_URL + owner,
      },
    })
    };

  return positions
}


module.exports = {
  ethereum: {
    liquidations: positions,
  },
};
