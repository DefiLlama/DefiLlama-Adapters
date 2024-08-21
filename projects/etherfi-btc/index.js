const ADDRESSES = require('../helper/coreAssets.json');
const sdk = require('@defillama/sdk');

//karak vault
async function tvl(api) {
  const balETH2 = await api.call({
    abi: "uint256:totalSupply",
    target: '0x7223442cad8e9cA474fC40109ab981608F8c4273',
  });
  api.add(ADDRESSES.ethereum.EETH, BigInt(balETH2));
}

module.exports = {
  doublecounted: true,
  ethereum: {
    tvl,
  },
};
