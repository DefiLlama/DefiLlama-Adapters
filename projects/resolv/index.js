const RLP = "0x4956b52aE2fF65D74CA2d61207523288e4528f96";

const erc20 = {
  "totalSupply": "uint256:totalSupply"
};

async function ethTvl(api) {
  api.add(RLP, await api.call({ abi: erc20.totalSupply, target: RLP }));
}

module.exports = {
  ethereum: {
    tvl: ethTvl
  }
};