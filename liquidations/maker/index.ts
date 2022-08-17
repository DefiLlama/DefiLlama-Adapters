import { ethers } from "ethers";
import { providers } from "../utils/ethers";
import BigNumber from "bignumber.js";
import { Liq } from "../utils/binResults";
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
  },
};

const positions = async (): Promise<Liq[]> => {
  // 1. go to cdp manager and call cdpi() to get the length of vaults array
  const cdpi = ((await cdpManager.cdpi()) as BigNumber).toNumber();
  const cdps = Array.from(Array(cdpi).keys()).map((x) => x + 1); // starts from 1

  // 2. then for each vaultNum (1 to cdpi):
  // - call ilks(vaultNum) to get ilkId of collateral, then you can use ilkRegistry.gem(ilkId) to get address of collateral token
  // - call owns(vaultNum) to get owner
  // - call urns(vaultNum) then that returns urnHandler, then call mcdVat.urns(ilkId, urnHandler), then from result  -> ink = amount of collateral in vault, art = amount of dai in debt
  const ilkIds = (
    (await sdk.api.abi.multiCall({
      calls: cdps.map((i) => ({ target: CDP_MANAGER.address, params: [i] })),
      abi: CDP_MANAGER.abis.ilks,
    })) as MulticallResponse<string>
  ).output.map((x) => x.output);

  const urnHandlers = (
    (await sdk.api.abi.multiCall({
      calls: cdps.map((i) => ({ target: CDP_MANAGER.address, params: [i] })),
      abi: CDP_MANAGER.abis.urns,
    })) as MulticallResponse<string>
  ).output.map((x) => x.output);

  const owners = (
    (await sdk.api.abi.multiCall({
      calls: cdps.map((i) => ({ target: CDP_MANAGER.address, params: [i] })),
      abi: CDP_MANAGER.abis.owns,
    })) as MulticallResponse<string>
  ).output.map((x) => x.output);

  const collaterals = (
    (await sdk.api.abi.multiCall({
      calls: ilkIds.map((ilkId) => ({ target: ILK_REGISTRY.address, params: [ilkId] })),
      abi: ILK_REGISTRY.abis.gem,
    })) as MulticallResponse<string>
  ).output.map((x) => x.output);

  const decimals = (
    (await sdk.api.abi.multiCall({
      calls: collaterals.map((collateral) => ({ target: collateral })),
      abi: "erc20:decimals",
    })) as MulticallResponse<string>
  ).output.map((x) => x.output);

  const urnParamPairs = cdps.map((i) => [ilkIds[i - 1], urnHandlers[i - 1]]);
  const urns: Urn[] = (
    (await sdk.api.abi.multiCall({
      calls: urnParamPairs.map((pair) => ({ target: MCD_VAT.address, params: pair })),
      abi: MCD_VAT.abis.urns,
    })) as MulticallResponse<Urn>
  ).output.map((x) => x.output);

  const positions: Liq[] = cdps
    .map((i) => {
      const { ink: collateralAmount, art: debt } = urns[i - 1];
      const owner = owners[i - 1];
      const collateral = "ethereum:" + collaterals[i - 1];
      const decimal = decimals[i - 1];

      const _debt = new BigNumber(debt).div(1e18);
      const _collateralAmount = new BigNumber(collateralAmount).div(10 ** Number(decimal));

      // liqPrice = debt/collateral*1.45
      const liqPrice = _debt.div(_collateralAmount).times(1.45).toNumber();

      return { collateralAmount, collateral, liqPrice, owner };
    })
    .filter((x) => !isNaN(x.liqPrice) && x.liqPrice > 0);

  return positions;
};

module.exports = {
  ethereum: {
    liquidations: positions,
  },
};
