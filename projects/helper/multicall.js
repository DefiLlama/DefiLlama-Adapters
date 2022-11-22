const { ethers } = require("ethers");

let MULTICALL = new ethers.Contract(
  "0xed386Fe855C1EFf2f843B910923Dd8846E45C5A4",
  ["function aggregate(tuple(address,bytes)[]) view returns (uint256, bytes[])"]
);

async function multicall(calls, overrides = {}) {
  let queries = new Array(calls.length);
  for (let i in calls) {
    const call = calls[i];
    let populatedTransaction;
    if (Array.isArray(call.args)) {
      populatedTransaction = await call.contract.populateTransaction[
        call.method
      ](...call.args);
    } else if (call.args == null) {
      populatedTransaction = await call.contract.populateTransaction[
        call.method
      ]();
    } else {
      populatedTransaction = await call.contract.populateTransaction[
        call.method
      ](call.args);
    }
    queries[i] = [call.contract.address, populatedTransaction.data];
  }
  let returnData;
  [, returnData] = await MULTICALL.connect(
    calls[0].contract.provider
  ).callStatic.aggregate(queries, overrides);
  let results = new Array(calls.length);
  for (let i in returnData) {
    const call = calls[i];
    let res = call.contract.interface.decodeFunctionResult(
      call.method,
      returnData[i]
    );
    if (res.length == 1) {
      results[i] = res[0];
    } else {
      results[i] = res;
    }
  }
  return results;
}

module.exports = {
  multicall,
};
