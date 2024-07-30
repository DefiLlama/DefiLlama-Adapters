const FBTC = '0xC96dE26018A54D51c097160568752c4E3BD6C364';

async function tvl(api) {
  return {
    [FBTC]: await api.call({ target: FBTC, abi: 'erc20:totalSupply' }),
  };
}

module.exports = {
  ethereum: { tvl },
  mantle: { tvl },
  bsc: { tvl },
};
