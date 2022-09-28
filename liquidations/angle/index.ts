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

const getPrices = async () => {
  const url: string = 'https://api.coingecko.com/api/v3/simple/price?ids=ageur&vs_currencies=usd';
  const price = (await axios.get(url)).data.ageur.usd;
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
  const vaultDebt = (await getPrices() * vaultDebtRaw); 
  return vaultDebt.toString();
}

const EXPLORER_BASE_URL = "https://etherscan.io/address/"

const positions = async () => {
  const vaultData: any[] = await getVaultData();

  const positions : {owner: string, collateral: string, collateralAmount: number, liquidationPrice: number, extra: any}[] = [];
  for (const vault of vaultData) {
    const owner = vault.owner;
    var collateral = vault.vaultManager.collateral;
    const collateralAmount = vault.collateralAmount;

    // liquidation price computation
    const vaultDebt = await getVaultDebt(vault.id);
    const collateralFactor = parseFloat(vault.vaultManager.collateralFactor) / 10e8
    let liquidationPrice: number
    if (collateral == '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599') {
      liquidationPrice = parseFloat(vaultDebt) / (parseFloat(collateralAmount)*10e9*collateralFactor)
    } else {
      liquidationPrice = parseFloat(vaultDebt) / (parseFloat(collateralAmount)*collateralFactor)
    }

    positions.push({
      owner: owner, 
      liquidationPrice: liquidationPrice,
      collateral: collateral, 
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



/*
positions().then(vaultData => {
    console.log(vaultData);
});
*/
