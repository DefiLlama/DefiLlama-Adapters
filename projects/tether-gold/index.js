const XAUt = {
  ethereum: "0x68749665ff8d2d112fa859aa293f07a622782f38",
  monad: "0x01bFF41798a0BcF287b996046Ca68b395DbC1071",
  polygon: "0xf1815bd50389c46847f0bda824ec8da914045d14",
  plasma: "0x1b64b9025eebb9a6239575df9ea4b9ac46d4d193",
  avax: "0x2775d5105276781b4b85ba6ea6a6653beed1dd32",
  celo: "0xaf37e8b6c9ed7f6318979f56fc287d76c30847ff",
  ink: "0xf50258d3c1dd88946c567920b986a12e65b50dac",
  arbitrum: "0x40461291347e1ecbb09499f3371d3f17f10d7159",
};

module.exports = {
  methodology: "TVL corresponds to the total amount of XAUt minted",
  ...Object.fromEntries(
    Object.entries(XAUt).map(([chain, address]) => [
      chain,
      {
        tvl: async (api) => {
          const totalSupply = await api.call({
            target: address,
            abi: "erc20:totalSupply",
            chain,
          });
          api.add(address, totalSupply);
        },
      },
    ])
  ),
};
