const USR = "0x66a1E37c9b0eAddca17d3662D6c05F4DECf3e110";

const erc20 = {
  "totalSupply": "uint256:totalSupply"
};

async function ethTvl(api) {
  api.add(USR, await api.call({ abi: erc20.totalSupply, target: USR }));
}

module.exports = {
  ethereum: {
    tvl: ethTvl
  }
};