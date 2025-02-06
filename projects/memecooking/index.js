const { addTokenBalances } = require("../helper/chain/near");

const MEMECOOKING_CONTRACT = 'meme-cooking.near';
const FT_NEAR = 'wrap.near'

module.exports = {
  methodology: 'Amount of wNEAR in the MEMECOOKING contract',
  near: {
    tvl: () => addTokenBalances([FT_NEAR], MEMECOOKING_CONTRACT),
  }
}; 