const sdk = require('@defillama/sdk');
const ADDRESSES = require('../helper/coreAssets.json')
const FYDE_CONTRACT = "0x87Cc45fFF5c0933bb6aF6bAe7Fc013b7eC7df2Ee";

async function tvl(_, _1, _2, { api }) {

  const assetNumber = await api.call({
    abi: 'function getAssetsListLength() public view returns (uint256)',
    target: FYDE_CONTRACT,
  });

  for (let i = 0; i < assetNumber; i++) {
    const asset = await api.call({
      abi: 'function assetsList(uint256) public view returns (address)',
      target: FYDE_CONTRACT,
      params: [i],
    });

    const balance = await api.call({
      abi: 'function totalAssetAccounting(address) public view returns (uint256)',
      target: FYDE_CONTRACT,
      params: [asset],
    });

    api.add(asset, balance);
  }


}



module.exports = {
  methodology: 'Read out balances from internal accounting for each asset in Fyde',
  ethereum: {
    tvl
  }
};