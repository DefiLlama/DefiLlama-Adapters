import { ethers } from "ethers";
import { providers } from "../utils/ethers";
import BigNumber from "bignumber.js";
import { Liq } from "../utils/binResults";

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

  // 2. then for each vaultNum (1 to cdpi):
  // - call ilks(vaultNum) to get ilkId of collateral, then you can use ilkRegistry.gem(ilkId) to get address of collateral token
  // - call owns(vaultNum) to get owner. it can be DSProxy, if so then call owner() on the returned address to get the owner of the vault, otherwise it is the owner of the vault
  // - call urns(vaultNum) then that returns urnHandler, then call mcdVat.urns(ilkId, urnHandler), then from result  -> ink = amount of collateral in vault, art = amount of dai in debt
  for (let i = 1; i <= cdpi; i++) {
    const ilkId = (await cdpManager.ilks(i)) as string;
    const collateralToken = (await ilkRegistry.gem(ilkId)) as string;
    const owner = (await cdpManager.owns(i)) as string;
    const urnHandler = (await cdpManager.urns(i)) as string;
    const { ink: collateral, art: debt } = (await mcdVat.urns(ilkId, urnHandler)) as {
      ink: BigNumber;
      art: BigNumber;
    };
    // liqPrice = debt/collateral*1.45
    // const liqPrice = BigNumber(debt).div(collateral);
    console.log(`${i}: ${collateralToken} - coll=${collateral}, debt=${debt} owner=${owner}`);
  }

  return [];
};

module.exports = {
  ethereum: {
    liquidations: positions,
  },
};
