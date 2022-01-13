const retry = require("./helper/retry");
const axios = require("axios");
const factory = "0x72cc6E4DE47f673062c41C67505188144a0a3D84";
const getDaos = {
  inputs: [],
  name: "getDaos",
  outputs: [{ internalType: "address[]", name: "", type: "address[]" }],
  stateMutability: "view",
  type: "function",
};

// on chain might work if we can get a list of tokens that they accept
async function tvl(chain, block, transform = (a) => a) {
  let balances = {};
  const daos = (
    await sdk.api.abi.call({
      chain,
      block,
      target: factory,
      abi: getDaos,
    })
  ).output;

  return balances;
}
async function ethereum(timestamp, block) {
  return await tvl("ethereum", block, (a) => a);
}

async function fetch() {
  return (
    await retry(
      async (bail) =>
        await axios.get(
          "https://firestore.googleapis.com/v1/projects/xdao-app/databases/(default)/documents/general/tvl"
        )
    )
  ).data.fields.value.doubleValue.toFixed();
}
module.exports = {
  fetch,
};
