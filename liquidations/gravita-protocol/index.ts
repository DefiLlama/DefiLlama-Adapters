import axios from "axios";
import BigNumber from "bignumber.js";
import { Liq } from "../utils/types";
const sdk = require("@defillama/sdk");

type MulticallResponse<T> = {
  output: {
    input: any;
    success: boolean;
    output: T;
  }[];
};

const ADMIN_CONTRACT_ADDRESS = "0xf7Cc67326F9A1D057c1e4b110eF6c680B13a1f53";
const VESSEL_MANAGER_CONTRACT_ADDRESS = "0xdB5DAcB1DFbe16326C3656a88017f0cB4ece0977";
const BLUSD_CONTRACT_ADDRESS = "0xB9D7DdDca9a4AC480991865EfEf82E01273F79C3";
const WETH_CONTRACT_ADDRESS = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

const EXPLORER_BASE_URL = "https://etherscan.io/address/";

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

// cr * debt / collateral = price
const calculateLiquidationPrice = (debt: string, collateral: string, cr: string) => {
  const price = new BigNumber(cr).times(debt).div(collateral).toString();
  return price;
};

const tokenToCollateralAddress = (token: string) => {
  if (token === WETH_CONTRACT_ADDRESS) {
    return "ethereum:0x0000000000000000000000000000000000000000"
  }
  return "ethereum:" + token
}

const positions = async () => {
  let collAddresses = (await sdk.api.abi.call({
    abi: "function getValidCollateral() external view returns (address[])",
    target: ADMIN_CONTRACT_ADDRESS,
  })).output;

  collAddresses = collAddresses.filter(i => i !== BLUSD_CONTRACT_ADDRESS) // BLUSD is not liquidatable

  // get prices for calculating recovery mode
  const prices = {}
  for (const c of collAddresses) {
    const info = await getTokenInfo(`ethereum:${c}`)
    prices[c] = BigNumber(info.price).times(10e18).toFixed()
  }

  const vesselCounts = (
    (await sdk.api.abi.multiCall({
      calls: collAddresses.map((i) => ({ target: VESSEL_MANAGER_CONTRACT_ADDRESS, params: [i] })), 
      abi: "function getVesselOwnersCount(address) external view returns (uint256)",
      requery: true,
    })) as MulticallResponse<number>
  ).output.map((x, i) => {
    return {
      asset: collAddresses[i],
      count: x.output
    }
  });

  const vesselOwnerQueries = ([] as any[]).concat(...vesselCounts.map(({ asset, count }) => {
    return Array.from(Array(Number(count))).map((_, i) => {
      return {
        target: VESSEL_MANAGER_CONTRACT_ADDRESS,
        params: [asset, i]
      }
    })
  }));

  const vesselAddresses = (
    (await sdk.api.abi.multiCall({
      calls: vesselOwnerQueries,
      abi: "function getVesselFromVesselOwnersArray(address,uint256) external view returns (address)",
      requery: true,
    })) as MulticallResponse<string>
  ).output.map((x, i) => {
    return {
      asset: vesselOwnerQueries[i].params[0],
      vessel: x.output
    }
  });

  const vesselDebtsAndCollaterals = (
    (await sdk.api.abi.multiCall({
      calls: vesselAddresses.map((i) => ({ target: VESSEL_MANAGER_CONTRACT_ADDRESS, params: [i.asset, i.vessel] })),
      abi: "function getEntireDebtAndColl(address,address) external view returns (uint256,uint256,uint256,uint256)",
      requery: true,
    })) as MulticallResponse<any>
  ).output.map((x, i) => {
    return {
      asset: vesselAddresses[i].asset,
      owner: vesselAddresses[i].vessel,
      coll: x.output[1],
      debt: x.output[0]
    }
  });

  const recoveryModeCRs = (
    (await sdk.api.abi.multiCall({
      calls: collAddresses.map((i) => ({ target: ADMIN_CONTRACT_ADDRESS, params: [i] })),
      abi: "function getCcr(address) external view returns (uint256)",
      requery: true,
    })) as MulticallResponse<string>
  ).output.map((x, i) => {
    return {
      asset: collAddresses[i],
      recoveryCR: BigNumber(x.output).div(10e17).toFixed(3)
    }
  });

  const minimumCRs = (
    (await sdk.api.abi.multiCall({
      calls: collAddresses.map((i) => ({ target: ADMIN_CONTRACT_ADDRESS, params: [i] })),
      abi: "function getMcr(address) external view returns (uint256)",
      requery: true,
    })) as MulticallResponse<string>
  ).output.map((x, i) => {
    return {
      asset: collAddresses[i],
      minCR: BigNumber(x.output).div(10e17).toFixed(3)
    }
  });

  const recoveryModes = (
    (await sdk.api.abi.multiCall({
      calls: collAddresses.map((i) => ({ target: VESSEL_MANAGER_CONTRACT_ADDRESS, params: [i, prices[i]] })),
      abi: "function checkRecoveryMode(address,uint256) external view returns (bool)",
      requery: true,
    })) as MulticallResponse<boolean>
  ).output.map((x, i) => {
    return {
      asset: collAddresses[i],
      isRecoveryMode: x.output
    }
  });

  const vessels = vesselDebtsAndCollaterals.map(({ asset, coll, debt, owner }) => {
    const cr = recoveryModes.find(i => i.asset === asset).isRecoveryMode ? 
      recoveryModeCRs.find(i => i.asset === asset).recoveryCR : 
      minimumCRs.find(i => i.asset === asset).minCR;
    return {
      owner,
      liqPrice: Number(calculateLiquidationPrice(debt, coll, cr)),
      collateral: tokenToCollateralAddress(asset), // ETH
      collateralAmount: coll,
      extra: {
        url: EXPLORER_BASE_URL + owner,
      },
    } as Liq;
  });

  return vessels;
};

module.exports = {
  ethereum: {
    liquidations: positions,
  },
};
