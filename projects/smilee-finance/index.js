const ADDRESSES = require('../helper/coreAssets.json')

const GBERA_CONTRACT = '0x3b3dd22625128Ff1548110f9B7Bc702F540668e2';

async function tvl(api) {
  const totalSupply = await api.call({
    abi: 'uint256:totalSupply',
    target: GBERA_CONTRACT,
  });
  
  api.add(ADDRESSES.null, totalSupply)
}

module.exports = {
  methodology: 'TVL of all the assets managed by gBERA',
  berachain: {
    tvl,
  }
};