module.exports = {
  berachain: {
    tvl: async (api) => {
      const pool = '0x3f7755117f1fec1981aefb01887240dbf5f2ebce';
      const token = await api.call({ target: pool, abi: 'address:wbera' });
      const balance = await api.call({ target: pool, abi: 'uint256:totalAssets' });
      api.addToken(token, balance);
    },
  },
};