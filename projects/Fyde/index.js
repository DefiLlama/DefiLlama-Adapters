const FYDE_CONTRACT = "0x87Cc45fFF5c0933bb6aF6bAe7Fc013b7eC7df2Ee";

const abi = {
  assetNumber: 'function getAssetsListLength() public view returns (uint256)',
  assetsList: 'function assetsList(uint256) public view returns (address)',
  totalBalance: 'function totalAssetAccounting(address) public view returns (uint256)',
};

async function tvl(_, _1, _2, { api }) {

  // get all assets
  const assetNumber = await api.call({
    abi: abi.assetNumber,
    target: FYDE_CONTRACT,
  });

  var index = Array.from({ length: assetNumber }, (value, index) => index);

  var batchCallData = [];

  index.forEach(idx => batchCallData.push(
    { target: FYDE_CONTRACT, abi: abi.assetsList, params: [idx] }
  ))

  const assets = await api.batchCall(batchCallData);

  // get all balances
  var batchCallData2 = [];

  assets.forEach(addr => batchCallData2.push(
    { target: FYDE_CONTRACT, abi: abi.totalBalance, params: [addr] }
  ))

  balances = await api.batchCall(batchCallData2);

  // add to api
  index.forEach(idx => api.add(assets[idx], balances[idx]));

}

module.exports = {
  methodology: 'Read out balances from internal accounting for each asset in Fyde',
  ethereum: {
    tvl
  }
};