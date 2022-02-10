const retry = require("async-retry");
const axios = require("axios");
const BigNumber = require("bignumber.js");

const GODWOKEN_RPC = "https://mainnet.godwoken.io/rpc";

async function getDRMPrice() {
  let pairReserves = await retry(
    async () =>
      await axios.post(GODWOKEN_RPC, {
        method: "poly_executeRawL2Transaction",
        jsonrpc: "2.0",
        params: [
          "0x84000000100000006c000000800000005c00000014000000180000001c0000002000000004000000279000000000000038000000ffffff504f4c590020bcbe00000000000000000000000000000000000000000000000000000000000000000000000000040000000902f1ac140000000c00000010000000000000000400000000000000",
        ],
        id: "69647cd1-3894-45a1-9548-27875a0c56c6",
      })
  );
  const drmAmount = new BigNumber(
    "0x" + pairReserves.data.result.return_data.slice(2, 66)
  ).div(10 ** 9);
  const usdcAmount = new BigNumber(
    "0x" + pairReserves.data.result.return_data.slice(66, 130)
  );
  const drmPrice = usdcAmount
    .div(drmAmount)
    .div(10 ** 6)
    .toFixed(2);

  return Number(drmPrice);
}

async function getSDRMSupply() {
  let supplyResponse = await retry(
    async () =>
      await axios.post(GODWOKEN_RPC, {
        method: "poly_executeRawL2Transaction",
        jsonrpc: "2.0",
        params: [
          "0x84000000100000006c000000800000005c00000014000000180000001c00000020000000858c0000179000001500000038000000ffffff504f4c590020bcbe00000000000000000000000000000000000000000000000000000000000000000000000000040000009358928b140000000c00000010000000000000000400000000000000",
        ],
        id: "69647cd1-3894-45a1-9548-27875a0c56c7",
      })
  );
  const sdrmSupply = new BigNumber(supplyResponse.data.result.return_data)
    .div(10 ** 9)
    .toFixed(2);

  return Number(sdrmSupply);
}

async function fetch() {
  const drmPrice = await getDRMPrice();
  const sdrmSupply = await getSDRMSupply();

  const tvl = drmPrice * sdrmSupply;
  return tvl;
}

module.exports = {
  fetch,
};
