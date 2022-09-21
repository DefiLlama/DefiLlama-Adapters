import { gql, request } from "graphql-request";
import { ethers } from "ethers";
import { providers } from "../utils/ethers";
import BigNumber from "bignumber.js";
import { getPagedGql } from "../utils/gql";
import { Liq } from "../utils/binResults";


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


/*
TODO: 
1 - fetch vaultDebt
2 - fetch EURUSD price for liquidation
*/



const getVaultData = async () => {
    const vaultData = (await getPagedGql(subgraphUrl, vaultDataQuery, "vaultDatas")) as VaultData[];
    return vaultData;
};




getVaultData().then(vaultData => {
    console.log(vaultData);
});
