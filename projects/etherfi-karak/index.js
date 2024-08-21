const ADDRESSES = require('../helper/coreAssets.json');
const sdk = require('@defillama/sdk');

//btc vault 
async function tvl(api) {
  const bal = await api.call({  //bal denominated in wbtc
    abi: "uint256:totalSupply",
    target: '0x657e8C867D8B37dCC18fA4Caead9C45EB088C642',
  });
  api.add(ADDRESSES.ethereum.WBTC, BigInt(bal));
}

module.exports = {
  doublecounted: false,
  ethereum: {
    tvl,
  },
};
