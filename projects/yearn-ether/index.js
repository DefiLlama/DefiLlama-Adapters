const { nullAddress } = require("../helper/unwrapLPs");
const YETH_POOL = '0x2cced4ffA804ADbe1269cDFc22D7904471aBdE63';

async function tvl(_, _1, _2, { api }) {
  const vb_prod_sum = await api.call({
    abi: 'uint256:vb_prod_sum',
    target: YETH_POOL,
  });

  return {
    [nullAddress]: vb_prod_sum[1]
  };
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: 'counts the total amount of ETH underlying the LSTs deposited into the yETH pool.',
  start: 1693971707,
  ethereum: { tvl }
};
