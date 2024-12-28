const MFILPOOLCONTRACT = '0x8aF827CDa3b7Eee9720496A30595D7Ee89A27ee2';
const MFILREGULARPOOLCONTRACT = '0xD4f7c1A09ed5f50a3eC2F1e9fcF8B1bc2d1d3d70'
const ADDRESSES = require('../helper/coreAssets.json')

async function mfilTvl(api) {
  const mfilPoolStakeMfil = await api.call({
    target: MFILPOOLCONTRACT,
    abi: "erc20:totalSupply",
  })

  api.add(ADDRESSES.null, mfilPoolStakeMfil)
}

module.exports = {
  filecoin: {
    tvl: mfilTvl
  }, 
}
