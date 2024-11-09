const USR = "0x66a1E37c9b0eAddca17d3662D6c05F4DECf3e110";
const RLP = "0x4956b52aE2fF65D74CA2d61207523288e4528f96";

const erc20 = {
  "totalSupply": "uint256:totalSupply"
};

async function ethTvl(api) {
  api.add(USR, await api.call({ abi: erc20.totalSupply, target: USR }));
  api.add(RLP, await api.call({ abi: erc20.totalSupply, target: RLP }));
}

module.exports = {
  ethereum: {
    tvl: ethTvl
  }
};