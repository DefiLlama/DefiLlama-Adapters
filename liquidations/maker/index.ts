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

const positions = async (): Promise<Liq[]> => {
  return [];
};

module.exports = {
  ethereum: {
    liquidations: positions,
  },
};
