const token = "0xd68458f51ce9feb238cdcf4cbcddf010eead01b4"
async function tvl(_, _1, _2, { api }) {
  const totalSupply = await api.call({
    abi: 'erc20:totalSupply',
    target: token
  });

  api.add(token, totalSupply)
}
module.exports = {
  start: 1053853,
  btr: {
    tvl: tvl
  },
};

