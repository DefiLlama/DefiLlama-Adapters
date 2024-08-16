const ADDRESSES = require('../helper/coreAssets.json')
const ZtakeV1Address = "0x9248F1Ee8cBD029F3D22A92EB270333a39846fB2"

async function tvl(api) {
  const totalSupply = await api.call({ abi: 'uint256:totalSupply', target: ZtakeV1Address });

  api.add(ADDRESSES.era.ZK, totalSupply)
}


module.exports = {
  methodology: 'Calls the totalSupply function from the staking contract',
  era: {
    tvl,
  }
};
