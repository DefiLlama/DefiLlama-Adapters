import { ethers } from "ethers";
import { providers } from "../utils/ethers";
import BigNumber from "bignumber.js";
import { Liq } from "../utils/binResults";
const sdk = require("@defillama/sdk");

function toHex(str: string) {
  return encodeURIComponent(str)
    .split("")
    .map(function (v) {
      return v.charCodeAt(0).toString(16);
    })
    .join("");
}

// all maker contracts: https://chainlog.makerdao.com/api/mainnet/active.json

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

const ilkRegistry = new ethers.Contract(
  "0x5a464C28D19848f44199D003BeF5ecc87d090F87",
  ["function gem(bytes32) view returns (address)"],
  providers.ethereum
);

const mcdVat = new ethers.Contract(
  "0x35D1b3F3D7966A1DFe207aa4514C12a259A0492B",
  ["function urns(bytes32, address) external view returns (uint256 ink, uint256 art)"],
  providers.ethereum
);

const positions = async (): Promise<Liq[]> => {
  // 1. go to cdp manager and call cdpi() to get the length of vaults array
  const cdpi = ((await cdpManager.cdpi()) as BigNumber).toNumber();
  const cdps = Array.from(Array(cdpi).keys()).map((x) => x + 1);

  const liqs = await Promise.all(cdps.map(getPositionByCdp));

  return [];
};

const queryBundle = async (i: number) => {
  const ilkId = (await cdpManager.ilks(i)) as string;
  const urnHandler = (await cdpManager.urns(i)) as string;

  return {
    i,
    ilkId,
    urnHandler,
  };
};

const handleQuery = async ({ i, ilkId, urnHandler }: { i: number; ilkId: string; urnHandler: string }) => {
  const collateralToken = (await ilkRegistry.gem(ilkId)) as string;
  const owner = (await cdpManager.owns(i)) as string;
  const { ink: collateral, art: debt } = (await mcdVat.urns(ilkId, urnHandler)) as {
    ink: BigNumber;
    art: BigNumber;
  };
  return {
    collateralToken,
    collateral,
    debt,
    owner,
  };
};

const getPositionByCdp = async (i: number) => {
  const ilkId = (await cdpManager.ilks(i)) as string;
  const collateral = (await ilkRegistry.gem(ilkId)) as string;
  const owner = (await cdpManager.owns(i)) as string;
  const urnHandler = (await cdpManager.urns(i)) as string;
  const { ink: collateralAmount, art: debt } = (await mcdVat.urns(ilkId, urnHandler)) as {
    ink: BigNumber;
    art: BigNumber;
  };
  // liqPrice = debt/collateral*1.45
  // const liqPrice = BigNumber(debt).div(collateral);
  console.log(`${i}: ${collateral} - coll=${collateralAmount}, debt=${debt} owner=${owner}`);
  return {
    collateral,
    collateralAmount,
    debt,
    owner,
  };
};

positions();
