const USR = "0x66a1E37c9b0eAddca17d3662D6c05F4DECf3e110";
const RLP = "0x4956b52aE2fF65D74CA2d61207523288e4528f96";
const RLPPriceStorage = "0x31319866778a5223633bd745780BB6d59406371E";

const erc20 = {
  "totalSupply": "uint256:totalSupply"
};
const rlpPriceStorage = {
  "lastPrice": "uint256:lastPrice"
};

async function ethTvl(api) {
  api.add(USR, await api.call({ abi: erc20.totalSupply, target: USR }));

  const rlpSupply = await api.call({ abi: erc20.totalSupply, target: RLP });
  const rlpPrice = await api.call({
      abi: rlpPriceStorage.lastPrice,
      target: RLPPriceStorage
    }
  ) / 1e18;
  api.add(RLP, rlpSupply * rlpPrice);
}

module.exports = {
  ethereum: {
    tvl: ethTvl
  }
};