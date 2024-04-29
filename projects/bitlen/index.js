
// const { sumTokensExport } = require("./helper/unwrapLPs");


// module.exports = {
//   bsquared: {
//       tvl: sumTokensExport({ 
//         owners: ['0x6996c446b1bfb8cc2ef7a4bc32979de613bcefe1', '0xad9b8b6c60ca112ab10670d87d53e6ff86ec3c2a', '0x779bddc3cBc62617093CB1E27436C78DA015508E'],
//         tokens: [ '0x4200000000000000000000000000000000000006','0x681202351a488040Fa4FdCc24188AfB582c9DD62','0xE544e8a38aDD9B1ABF21922090445Ba93f74B9E5'   ],
//       }),
//   }
// };

const WBTC_CONTRACT = '0x4200000000000000000000000000000000000006';
const WBTC_POOL = '0x6996c446b1bfb8cc2ef7a4bc32979de613bcefe1';

const USDT_CONTRACT = '0x681202351a488040Fa4FdCc24188AfB582c9DD62';
const USDT_POOL = '0xad9b8b6c60ca112ab10670d87d53e6ff86ec3c2a';

const USDC_CONTRACT = '0xE544e8a38aDD9B1ABF21922090445Ba93f74B9E5'
const USDC_POOL = '0x779bddc3cBc62617093CB1E27436C78DA015508E'



async function tvl(_, _1, _2, { api }) {

  const wbtcCollateralBalance = await api.call({
    abi: 'erc20:balanceOf',
    target: WBTC_CONTRACT,
    params: [WBTC_POOL],
  });

  const usdtCollateralBalance = await api.call({
    abi: 'erc20:balanceOf',
    target: USDT_CONTRACT,
    params: [USDT_POOL],
  });

  const usdcCollateralBalance = await api.call({
    abi: 'erc20:balanceOf',
    target: USDC_CONTRACT,
    params: [USDC_POOL],
  });

  api.add(WBTC_CONTRACT, wbtcCollateralBalance);
  api.add(USDT_CONTRACT, usdtCollateralBalance);
  api.add(USDC_CONTRACT, usdcCollateralBalance);
}
module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  start: 100,
  bsquared: {
    tvl,
  }
}; 