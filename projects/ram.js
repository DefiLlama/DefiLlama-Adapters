const retry = require("async-retry");
const axios = require("axios");
const Web3 = require("web3");
const abis = require("./config/ram/abis.js");

const rpcUrl = "https://mainnet-rpc.thundercore.com";
const controllerAddress = "0x0d4fe8832857Bb557d8CFCf3737cbFc8aE784106";

function fetch() {
  return retry(async () => await getTVL());
}

async function getTVL() {
  const web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl));
  const controller = new web3.eth.Contract(
    abis.abis.controller,
    controllerAddress
  );
  const markets = await controller.methods.getAllMarkets().call();
  const promises = markets.map((market) => getToken(market));
  const supplies = await Promise.all(promises);
  const sum = supplies.reduce((accu, cur) => accu + cur, 0);
  return sum;
}

async function getToken(tokenAddress) {
  const blockNumber = "latest";
  const methodIdDecimals = "0x313ce567"; // head(keccak("decimals"))"
  const methodIdTotalSupply = "0x18160ddd";
  const methodIdExchangeCurrent = "0xbd6d894d";
  const methodIdUnderlying = "0x6f307dc3";
  const methodIdSymbol = "0x95d89b41";
  const methodIdPrice = "0xfc57d4df" + "0".repeat(12 * 2);
  const ids = [
    methodIdDecimals,
    methodIdTotalSupply,
    methodIdExchangeCurrent,
    methodIdSymbol,
    methodIdUnderlying,
  ];
  let data = ids.map((id, index) => ({
    jsonrpc: "2.0",
    id: index + 1,
    method: "eth_call",
    params: [
      {
        to: tokenAddress,
        data: id,
      },
      blockNumber,
    ],
  }));
  data.push({
    jsonrpc: "2.0",
    id: data.length + 1,
    method: "eth_call",
    params: [
      {
        to: "0x3cf48e022FFD39379147332Cc04D9a901921ba71",
        data: methodIdPrice + tokenAddress.slice(2),
      },
      blockNumber,
    ],
  });

  const response = await axios.post(rpcUrl, data, {
    headers: { "Content-Type": "application/json" },
  });

  if (response.status < 200 || 299 < response.status) {
    throw `HTTP ${response.status}`;
  }
  const r = response.data;

  if (r[0]["result"] === "0x") {
    throw "tokenAddress invalid for chain";
  }
  const b = parseInt(r[1]["result"]);
  const ex = parseInt(r[2]["result"]);

  // console.log("r3", r[3]["result"]);

  const sy = Web3.utils.hexToAscii("0x" + r[3]["result"].slice(64 + 64 + 2));
  const p = r[5]["result"];
  if (!sy.includes("rTT")) {
    const token = "0x" + BigInt(r[4]["result"]).toString(16);
    const data = {
      jsonrpc: "2.0",
      id: 1,
      method: "eth_call",
      params: [
        {
          to: token,
          data: methodIdDecimals,
        },
        blockNumber,
      ],
    };
    const response = await axios.post(rpcUrl, data, {
      headers: { "Content-Type": "application/json" },
    });

    if (response.status < 200 || 299 < response.status) {
      throw `HTTP ${response.status}`;
    }
    const re = response.data;
    if (re["result"] === "0x") {
      throw "tokenAddress invalid for chain";
    }
    decimals = parseInt(re["result"]);
  }
  return (((b * ex) / 1e18) * p) / 1e36;
}

module.exports = {
  fetch,
};
