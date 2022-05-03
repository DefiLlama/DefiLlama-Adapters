const { ethers } = require("ethers");
const erc20Abi = require("../helper/abis/erc20.json");
const {
  AMP,
  CURRENT,
  fuseLPs,
} = require("./constants");

const provider = new ethers.providers.JsonRpcProvider("https://rpc.fuse.io");

const amp = new ethers.Contract(AMP, Object.values(erc20Abi), provider);
exports.amp = amp;
const current = new ethers.Contract(CURRENT, Object.values(erc20Abi), provider);
exports.current = current;
const ampFuseLp = new ethers.Contract(
  fuseLPs[0],
  Object.values(erc20Abi),
  provider
);
exports.ampFuseLp = ampFuseLp;
const currentFuseLp = new ethers.Contract(
  fuseLPs[1],
  Object.values(erc20Abi),
  provider
);
exports.currentFuseLp = currentFuseLp;
