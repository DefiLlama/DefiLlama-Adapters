const ADDRESSES = require('../helper/coreAssets.json')
const { staking } = require('../helper/staking');

const sellerContract = "0xc73C6C3e80C28dBc55F65bBdC895E828bb98C72d";
const stakingContract = "0x21edB57A75ee69BCe0Fe3D0EfC5674bcF1D5BF93";

const TIDAL = "0xB41EC2c036f8a42DA384DDE6ADA79884F8b84b26";


const polygonTvl = async (api) => {
  return api.sumTokens({ owner: sellerContract, tokens: [ADDRESSES.polygon.USDC] })
};

module.exports = {
  polygon: {
    staking: staking(stakingContract, TIDAL,),
    tvl: polygonTvl,
  },
  methodology:
    "We count liquidity of USDC Reserve deposited on the pool threw Seller contract; and the staking of native token",
};
