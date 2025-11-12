const APL_TOKEN = '0xfE82012eCcE57a188E5f9f3fC1Cb2D335C58F1f5';

async function tvl(api) {
  const totalSupply = await api.call({ abi: 'uint256:totalSupply', target: APL_TOKEN, });
  api.add(APL_TOKEN, totalSupply)
}

module.exports = {
  methodology: 'Count total issued APL tokens which are backed by reserve RWAs.',
  start: '2025-06-25',
  sty: {
    tvl,
  },
};
