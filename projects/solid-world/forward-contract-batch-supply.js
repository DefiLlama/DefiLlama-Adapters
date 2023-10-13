const ADDRESSES = require('../helper/coreAssets.json')
const { getLogs } = require("../helper/cache/getLogs");
const { config } = require("./config");
const BigNumber = require("bignumber.js");

const nullTopic = '0x0000000000000000000000000000000000000000000000000000000000000000'
const abis = {
  transferSingle: "event TransferSingle (address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value)",
  transferBatch: "event TransferBatch (address indexed operator, address indexed from, address indexed to, uint256[] ids, uint256[] values)",
}

async function fetchForwardContractBatchSupplies(api) {
  const mintLogs = await getLogs({
    api,
    onlyArgs: true,
    fromBlock: 42782566,
    topics: ['0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62', null, nullTopic],
    eventAbi: abis.transferSingle,
    extraKey: 'mint-transfer-single',
    target: config[api.chain].ForwardContractBatchToken
  });
  const burnLogs = await getLogs({
    api,
    onlyArgs: true,
    fromBlock: 42782566,
    topics: ['0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62', null, null, nullTopic],
    eventAbi: abis.transferSingle,
    extraKey: 'burn-transfer-single',
    target: config[api.chain].ForwardContractBatchToken
  });
  const transferBatchBurnLogs = await getLogs({
    api,
    onlyArgs: true,
    fromBlock: 42782566,
    topics: ["0x4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb", null, null, nullTopic],
    eventAbi: abis.transferBatch,
    extraKey: 'burn-transfer-batch',
    target: config[api.chain].ForwardContractBatchToken
  });

  const supply = {};

  mintLogs
    .forEach(mint => {
      const batchId = mint.id.toString();
      supply[batchId] = (supply[batchId] || BigNumber(0)).plus(mint.value.toString());
    });
  burnLogs
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

  transferBatchBurnLogs
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
