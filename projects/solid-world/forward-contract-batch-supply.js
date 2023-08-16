const { getLogs } = require("../helper/cache/getLogs");
const { config } = require("./config");
const BigNumber = require("bignumber.js");

async function fetchForwardContractBatchSupplies(api) {
  const transferSingleLogs = await getLogs({
    api,
    onlyArgs: true,
    fromBlock: 42782566,
    topics: ["0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62"],
    eventAbi: "event TransferSingle (address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value)",
    target: config[api.chain].ForwardContractBatchToken
  });
  const transferBatchLogs = await getLogs({
    api,
    onlyArgs: true,
    fromBlock: 42782566,
    topics: ["0x4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb"],
    eventAbi: "event TransferBatch (address indexed operator, address indexed from, address indexed to, uint256[] ids, uint256[] values)",
    target: config[api.chain].ForwardContractBatchToken
  });

  const supply = {};

  transferSingleLogs.filter(log => log.from === "0x0000000000000000000000000000000000000000")
    .forEach(mint => {
      const batchId = mint.id.toString();
      supply[batchId] = (supply[batchId] || BigNumber(0)).plus(mint.value.toString());
    });
  transferSingleLogs.filter(log => log.to === "0x0000000000000000000000000000000000000000")
    .map(burn => {
      const batchId = burn.id.toString();
      if (!supply[batchId]) {
        throw new Error(`Burned batch ${batchId} without minting it first.`);
      }

      supply[batchId] = supply[batchId].minus(burn.value.toString());

      if (supply[batchId].isNegative()) {
        throw new Error(`Burned more than minted for batch ${batchId}`);
      }
    });

  transferBatchLogs.filter(log => log.to === "0x0000000000000000000000000000000000000000")
    .forEach(batchBurn => batchBurn.ids.forEach((burnId, i) => {
      const batchId = burnId.toString();
      if (!supply[batchId]) {
        throw new Error(`Burned batch ${batchId} without minting it first.`);
      }

      supply[batchId] = supply[batchId].minus(batchBurn.values[i].toString());

      if (supply[batchId].isNegative()) {
        throw new Error(`Burned more than minted for batch ${batchId}`);
      }
    }));

  return supply;
}

module.exports = {
  fetchForwardContractBatchSupplies
};
