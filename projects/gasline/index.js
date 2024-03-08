const GASLINE_CONTRACT = {
  81457: '0xD5400cAc1D76f29bBb8Daef9824317Aaf9d3C0a1',
  56: '0x35138Ddfa39e00C642a483d5761C340E7b954F94',
};

const WETH = {
  81457: '0x4300000000000000000000000000000000000004',
  56: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
};

const abi = {
  balanceOf: "erc20:balanceOf",
  totalSupply: "function totalSupply() view returns (uint256)",
};

function tvl(chainId) {
  return async function(_, _1, _2, { api }) {
    const deposited = await api.call({ abi: abi.balanceOf, target: WETH[chainId], params: GASLINE_CONTRACT[chainId] });

    api.addGasToken(deposited);
  }
}

function borrowed(chainId) {
  return async function(_, _1, _2, { api }) {
    const borrowed = await api.call({ abi: abi.totalSupply, target: GASLINE_CONTRACT[chainId] });

    api.addGasToken(borrowed);
  }
}

module.exports = {
  doublecounted: true,
  blast: {
    tvl: tvl(81457),
    borrowed: borrowed(81457),
  },
  bsc: {
    tvl: tvl(56),
    borrowed: borrowed(56),
  },
};
