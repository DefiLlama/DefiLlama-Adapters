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

// not used
enum ChainID {
  ethereum = 1,
  polygon = 137,
  optimism = 10,
  arbitrum = 42161,
}

type VaultManagersData = {
    address: string;
    collateral: string;
    decimals: number;
    collateralFactor: string;
    stablecoin: string;
};

const getVaultManagers = async (chainID: ChainID) => {
  const info = (await axios.get("https://api.angle.money/v1/vaultManagers?chainId=" + String(chainID))).data;
  const vaultManagers: VaultManagersData[] = [];
  for (const vaultManager in info) {
    const address = info[vaultManager].address
    const collateral = info[vaultManager].collateral
    const collateralFactor = info[vaultManager].maxLTV
    const stablecoin = info[vaultManager].stablecoin
    const decimals = info[vaultManager].decimals
    vaultManagers.push({
      address,
      collateral,
      decimals,
      collateralFactor,
      stablecoin
    });
  }
  return vaultManagers;
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


const positions = (chain: Chain) => async () => {
  let chainID: number
  if (chain == "ethereum") { 
    chainID = 1 
  } else if (chain == "polygon") { 
    chainID = 137 
  } else if (chain == "optimism") { 
    chainID = 10 
  } else if (chain == "arbitrum") {
    chainID = 42161
  }
  const vaultManagers = (await getVaultManagers(chainID))
  const positions: Liq[] = [];
  for (let i = 0; i < vaultManagers.length; i++) {
    console.log(i)
    const vaultManagerAddress = vaultManagers[i].address
    const collateral = vaultManagers[i].collateral
    const collateralFactor = vaultManagers[i].collateralFactor
    const collateralDecimals = vaultManagers[i].decimals
    const vaultManagerContract = new ethers.Contract(
      vaultManagerAddress,
      [
        "function vaultIDCount() external view returns (uint256)",
        "function vaultData(uint256 vaultID) external view returns (uint256 collateralAmount, uint256 normalizedDebt)",
        "function ownerOf(uint256 vaultID) external view returns (address)",
        "function getVaultDebt(uint256 vaultID) external view returns (uint256)"
      ],
      providers[chain]
    );
    const vaultIDCount = BigNumber((await vaultManagerContract.vaultIDCount()).toString());

    // each vault data
    for (let id = 0; id <= Number(vaultIDCount); id++) {
      // gives the collateralAmount and the normalizeDebt
      const vaultData = (await vaultManagerContract.vaultData(id)).toString();
      const collateralAmount = vaultData.split(",")[0]
      let debt: string;
      let owner: string;
      let liqPrice: number;

      if (collateralAmount < 1) {
        // filter empty/inactive vaults
      } else {
        owner = (await vaultManagerContract.ownerOf(id));
        debt = (await vaultManagerContract.getVaultDebt(id)).toString();
        const debtConverted = BigNumber(debt).times((await getTokenInfo(AGEUR_TOKEN_ID)).price).toString()

        // compute liquidation price
        if (collateralDecimals != 18) {
          // correcting the number of decimals
          liqPrice = BigNumber(debtConverted)
            .div(BigNumber(collateralAmount).times(collateralFactor))
            .times(10 ** (collateralDecimals - 18))
            .toNumber();
        } else {
          liqPrice = BigNumber(debtConverted).div(BigNumber(collateralAmount).times(collateralFactor)).toNumber();
        };
        console.log("✅", chain, vaultManagerAddress)
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
    }
  }
  return positions.filter((position) => position.liqPrice > 0);
}


const explorers: { [key: string]: string } = {
  ethereum: "https://etherscan.io/",
  polygon: "https://polygonscan.com/",
  optimism: "https://optimistic.etherscan.io/",
  arbitrum: "https://arbiscan.io/",
};



/*
positions(Chain.optimism)().then(data => {
  console.log(data);
});
*/

module.exports = {
  ethereum: {
    liquidations: positions(Chain.ethereum),
  },
  polygon: {
    liquidations: positions(Chain.polygon),
  },
  optimism: {
    liquidations: positions(Chain.optimism),
  },
  arbitrum: {
    liquidations: positions(Chain.arbitrum),
  },
};