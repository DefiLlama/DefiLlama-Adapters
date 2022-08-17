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

const positions = async (): Promise<Liq[]> => {
  // all maker contracts: https://chainlog.makerdao.com/api/mainnet/active.json
  const ilkRegistry = new ethers.Contract(
    "0x5a464C28D19848f44199D003BeF5ecc87d090F87",
    ["function gem(bytes32) view returns (address)"],
    providers.ethereum
  );
  let ilks = new Set<string>();
  return [];
};

module.exports = {
  ethereum: {
    liquidations: positions,
  },
};
