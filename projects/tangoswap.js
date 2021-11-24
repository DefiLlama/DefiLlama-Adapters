const { calculateUsdUniTvl } = require('./helper/getUsdUniTvl');
const { addFundsInMasterChef } = require('./helper/masterchef');
const { getBlock } = require('./helper/getBlock');

const factory = '0x2F3f70d13223EDDCA9593fAC9fc010e912DF917a';
const masterChef = '0x38cC060DF3a0498e978eB756e44BD43CC4958aD9';

// async function tvl(timestamp, block, chainBlocks) {
//     const balances = {};
//     block = await getBlock(timestamp, "smartbch", chainBlocks, true);
//     await addFundsInMasterChef(
//       balances,
//       masterChef,
//       block,
//       "smartbch",
//     );
  
//     return balances;
//   };

module.exports = {
    misrepresentedTokens: true,
    smartbch: {
        tvl: calculateUsdUniTvl(factory, "smartbch", "0x3743eC0673453E5009310C727Ba4eaF7b3a1cc04", [], "bitcoin-cash"),
    },
} // node test.js projects/tangoswap.js