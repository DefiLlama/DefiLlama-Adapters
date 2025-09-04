const sdk = require("@defillama/sdk");

const vault = "0xC10aA720dFde56be6fB37F91189a64215a61ddc3";
const hestiaToken = "0xBC7755a153E852CF76cCCDdb4C2e7c368f6259D8";

const getAllChiefsAbi = {
  "inputs":[
    { "internalType":"uint256","name":"offset","type":"uint256" },
    { "internalType":"uint256","name":"limit","type":"uint256" }
  ],
  "name":"getAllChiefs",
  "outputs":[
    { "internalType":"struct MiningChiefOverview[]","name":"","type":"tuple[]",
      "components":[
        { "internalType":"uint256","name":"buyTotal","type":"uint256" },
        { "internalType":"uint256","name":"fragmentValue","type":"uint256" }
      ]
    }
  ],
  "stateMutability":"view",
  "type":"function"
};

async function tvl() {
  let total = 0;
  let offset = 0;
  const limit = 50;
  let batch;

  do {
    batch = await sdk.api.abi.call({
      target: vault,
      abi: getAllChiefsAbi,
      params: [offset, limit],
      chain: "base"
    });

    for (const chief of batch.output) {
      total += Number(chief.buyTotal);
    }

    offset += limit;
  } while (batch.output.length === limit);

  return { [hestiaToken]: total.toString() };
}

module.exports = { base: { tvl } };
