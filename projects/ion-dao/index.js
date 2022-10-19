const axios = require("axios");
const protobuf = require("protobufjs/minimal");
const { toUSDTBalances } = require("../helper/balances");
const { getPrices } = require("../helper/utils");

const ENDPOINT = "https://rpc.osmosis.zone";

const ION_DAO_CONTRACT =
  "osmo1yg8930mj8pk288lmkjex0qz85mj8wgtns5uzwyn2hs25pwdnw42sf745wc";

const encodeToProtobuf = (obj) => {
  const queryData = new TextEncoder().encode(`${JSON.stringify(obj)}`);
  const message = { address: ION_DAO_CONTRACT, queryData };

  const writer = protobuf.Writer.create();
  writer.uint32(10).string(message.address);
  writer.uint32(18).bytes(message.queryData);
  const data = writer.finish();

  return Buffer.from(data).toString("hex");
};

const decodeFromProtobuf = (data) => {
  const reader = new protobuf.Reader(data);
  let end = reader.pos + data.length;
  let message;
  while (reader.pos < end) {
    const tag = reader.uint32();
    switch (tag >>> 3) {
      case 1:
        message = reader.bytes();
        break;
      default:
        reader.skipType(tag & 7);
        break;
    }
  }
  return Buffer.from(message).toString("utf-8");
};

const getTotalLockedAmountByHeight = async (blockHeight) => {
  const payload = encodeToProtobuf({
    total_power_at_height: { height: blockHeight },
  });

  const { data } = await axios.post(ENDPOINT, {
    jsonrpc: "2.0",
    id: 1,
    method: "abci_query",
    params: {
      path: "/cosmwasm.wasm.v1.Query/SmartContractState",
      data: payload,
      prove: false,
    },
  });

  let decoded = data["result"]["response"]["value"];
  decoded = Buffer.from(decoded, "base64");
  decoded = decodeFromProtobuf(decoded);

  const { power } = JSON.parse(decoded);
  return power / 1e6;
};

const tvl = async (_timestamp, blockHeight, _chainBlocks, _chain) => {
  const [prices, totalLockedAmount] = await Promise.all([
    getPrices([{ ion: "ion" }]),
    getTotalLockedAmountByHeight(blockHeight),
  ]);
  const price = prices.data.ion.usd;
  return toUSDTBalances(totalLockedAmount * price);
};

module.exports = {
  timetravel: true,
  start: 5887991,
  osmosis: {
    tvl,
  },
};
