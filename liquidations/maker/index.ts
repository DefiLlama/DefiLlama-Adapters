import { ethers } from "ethers";
import { providers } from "../utils/ethers";
import BigNumber from "bignumber.js";
import { Liq } from "../utils/types";
const sdk = require("@defillama/sdk");

// all maker contracts: https://chainlog.makerdao.com/api/mainnet/active.json

type MulticallResponse<T> = {
  output: {
    input: any;
    success: boolean;
    output: T;
  }[];
};
type Urn = {
  ink: string;
  art: string;
};
type Ilk = {
  Art: string;
  rate: string;
  spot: string;
  line: string;
  dust: string;
};
type Spot = {
  pip: string;
  mat: string;
};

const CDP_MANAGER = {
  address: "0x5ef30b9986345249bc32d8928B7ee64DE9435E39",
  abis: {
    urns: {
      constant: true,
      inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      name: "urns",
      outputs: [{ internalType: "address", name: "", type: "address" }],
      payable: false,
      stateMutability: "view",
      type: "function",
    },
    ilks: {
      constant: true,
      inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      name: "ilks",
      outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
      payable: false,
      stateMutability: "view",
      type: "function",
    },
    owns: {
      constant: true,
      inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      name: "owns",
      outputs: [{ internalType: "address", name: "", type: "address" }],
      payable: false,
      stateMutability: "view",
      type: "function",
    },
  },
};
const cdpManager = new ethers.Contract(
  "0x5ef30b9986345249bc32d8928B7ee64DE9435E39",
  [
    "function cdpi() external view returns (uint256)",
    "function ilks(uint256) external view returns (bytes32)",
    "function owns(uint256) external view returns (address)",
    "function urns(uint256) external view returns (address)",
  ],
  providers.ethereum
);

const ILK_REGISTRY = {
  address: "0x5a464C28D19848f44199D003BeF5ecc87d090F87",
  abis: {
    gem: {
      inputs: [{ internalType: "bytes32", name: "ilk", type: "bytes32" }],
      name: "gem",
      outputs: [{ internalType: "address", name: "", type: "address" }],
      stateMutability: "view",
      type: "function",
    },
  },
};

const MCD_VAT = {
  address: "0x35D1b3F3D7966A1DFe207aa4514C12a259A0492B",
  abis: {
    urns: {
      constant: true,
      inputs: [
        { internalType: "bytes32", name: "", type: "bytes32" },
        { internalType: "address", name: "", type: "address" },
      ],
      name: "urns",
      outputs: [
        { internalType: "uint256", name: "ink", type: "uint256" },
        { internalType: "uint256", name: "art", type: "uint256" },
      ],
      payable: false,
      stateMutability: "view",
      type: "function",
    },
    ilks: {
      constant: true,
      inputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
      name: "ilks",
      outputs: [
        { internalType: "uint256", name: "Art", type: "uint256" },
        { internalType: "uint256", name: "rate", type: "uint256" },
        { internalType: "uint256", name: "spot", type: "uint256" },
        { internalType: "uint256", name: "line", type: "uint256" },
        { internalType: "uint256", name: "dust", type: "uint256" },
      ],
      payable: false,
      stateMutability: "view",
      type: "function",
    },
  },
};

const MCD_SPOT = {
  address: "0x65C79fcB50Ca1594B025960e539eD7A9a6D434A3",
  abis: {
    ilks: {
      constant: true,
      inputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
      name: "ilks",
      outputs: [
        { internalType: "contract PipLike", name: "pip", type: "address" },
        { internalType: "uint256", name: "mat", type: "uint256" },
      ],
      payable: false,
      stateMutability: "view",
      type: "function",
    },
  },
};

const ERC20 = {
  abis: {
    decimals: {
      inputs: [],
      name: "decimals",
      outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
      stateMutability: "view",
      type: "function",
    },
  },
};

// the collateral price at which the collateral ratio is reached
function collateralPriceAtRatio({
  colRatio,
  collateral,
  vaultDebt,
}: {
  colRatio: BigNumber;
  collateral: BigNumber;
  vaultDebt: BigNumber;
}): BigNumber {
  return collateral.isZero() || vaultDebt.isZero() ? new BigNumber("0") : vaultDebt.times(colRatio).div(collateral);
}

const INSPECTOR_BASE_URL = "https://oasis.app/";

const positions = async (): Promise<Liq[]> => {
  const cdpi = ((await cdpManager.cdpi()) as BigNumber).toNumber();
  const cdps = Array.from(Array(cdpi).keys()).map((x) => x + 1); // starts from 1

  const ilkIds = (
    (await sdk.api.abi.multiCall({
      calls: cdps.map((i) => ({ target: CDP_MANAGER.address, params: [i] })),
      abi: CDP_MANAGER.abis.ilks,
      requery: true,
    })) as MulticallResponse<string>
  ).output.map((x) => x.output);

  const urnHandlers = (
    (await sdk.api.abi.multiCall({
      calls: cdps.map((i) => ({ target: CDP_MANAGER.address, params: [i] })),
      abi: CDP_MANAGER.abis.urns,
      requery: true,
    })) as MulticallResponse<string>
  ).output.map((x) => x.output);

  const owners = (
    (await sdk.api.abi.multiCall({
      calls: cdps.map((i) => ({ target: CDP_MANAGER.address, params: [i] })),
      abi: CDP_MANAGER.abis.owns,
      requery: true,
    })) as MulticallResponse<string>
  ).output.map((x) => x.output);

  const collaterals = (
    (await sdk.api.abi.multiCall({
      calls: ilkIds.map((ilkId) => ({ target: ILK_REGISTRY.address, params: [ilkId] })),
      abi: ILK_REGISTRY.abis.gem,
      requery: true,
    })) as MulticallResponse<string>
  ).output.map((x) => x.output);

  const spots = (
    (await sdk.api.abi.multiCall({
      calls: ilkIds.map((ilkId) => ({ target: MCD_SPOT.address, params: [ilkId] })),
      abi: MCD_SPOT.abis.ilks,
      requery: true,
    })) as MulticallResponse<Spot>
  ).output.map((x) => x.output);

  const decimals = (
    (await sdk.api.abi.multiCall({
      calls: collaterals.map((collateral) => ({ target: collateral })),
      abi: "erc20:decimals",
      //   requery: true,
    })) as MulticallResponse<string>
  ).output.map((x) => x.output);

  const urnParamPairs = cdps.map((i) => [ilkIds[i - 1], urnHandlers[i - 1]]);
  const urns: Urn[] = (
    (await sdk.api.abi.multiCall({
      calls: urnParamPairs.map((pair) => ({ target: MCD_VAT.address, params: pair })),
      abi: MCD_VAT.abis.urns,
      requery: true,
    })) as MulticallResponse<Urn>
  ).output.map((x) => x.output);

  const ilks: Ilk[] = (
    (await sdk.api.abi.multiCall({
      calls: ilkIds.map((ilkId) => ({ target: MCD_VAT.address, params: [ilkId] })),
      abi: MCD_VAT.abis.ilks,
      requery: true,
    })) as MulticallResponse<Ilk>
  ).output.map((x) => x.output);

  const positions = cdps
    .map((i) => {
      const urn = urns[i - 1];
      const _collateralAmount = urn.ink;
      const collateralAmount = new BigNumber(_collateralAmount).div(1e18); // in wei
      const normalizedDebt = new BigNumber(urn.art).div(1e18); // in wei
      const ilk = ilks[i - 1];
      // const normalizedIlkDebt = ilk.Art; // in wei
      const debtScalingFactor = new BigNumber(ilk.rate).div(1e27); // in ray (27 decimal places)
      // const maxDebtPerUnitCollateral = ilk.spot; // in ray (27 decimal places)
      // const debtCeiling = ilk.line; // in rad (45 decimal places)
      // const debtFloor = ilk.dust; // in rad (45 decimal places)
      const spot = spots[i - 1];
      const liquidationRatio = new BigNumber(spot.mat).div(1e27); // in ray (27 decimal places)
      const debt = normalizedDebt.times(debtScalingFactor);

      const liqPrice = collateralPriceAtRatio({
        colRatio: liquidationRatio,
        collateral: collateralAmount,
        vaultDebt: debt,
      }).toNumber();

      const owner = owners[i - 1].toLowerCase();
      const collateral = "ethereum:" + collaterals[i - 1].toLowerCase();

      const decimal = decimals[i - 1];
      const collateralAmountFormatted = collateralAmount.times(10 ** Number(decimal)).toFixed(0);

      return {
        collateralAmount: collateralAmountFormatted,
        collateral,
        liqPrice,
        owner,
        extra: {
          displayName: `Vault ${i}`,
          url: INSPECTOR_BASE_URL + i,
        },
      } as Liq;
    })
    .filter((x) => x.liqPrice > 0);

  return positions;
};

module.exports = {
  ethereum: {
    liquidations: positions,
  },
};
