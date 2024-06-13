const ADDRESSES = require('../helper/coreAssets.json')
const chains = [
  "ethereum",
  "arbitrum",
  "optimism",
  "mode",
  "manta",
  "blast",
  "linea",
];

const WEETH_ADDRESS = {
  ethereum: "0xCd5fE23C85820F7B72D0926FC9b05b43E359b7ee",
  arbitrum: "0x35751007a407ca6FEFfE80b3cB397736D2cf4dbe",
  optimism: "0x346e03f8cce9fe01dcb3d0da3e9d00dc2c0e08f0",
  mode: ADDRESSES.blast.weETH,
  manta: "0x77b6F99970f488cFA8bd41892900b6Ce881C2300",
  blast: ADDRESSES.blast.weETH,
  linea: "0x1bf74c010e6320bab11e2e5a532b5ac15e0b8aa6",
};

const CAP_ADDRESS = {
  ethereum: "0x451d791b6e9a9b8c9237bb55e58a7757342b16f9",
  blast: "0x096430ef0a653c067df32e93ff77090e084169de",
  linea: "0xcd32876b9b483eb75e8ca74935e4b51725f33a91",
};

chains.forEach((chain) => {
  module.exports[chain] = {
    tvl: async (api) => {
      const cap =
        CAP_ADDRESS[chain] ?? "0xb883ee478d3b7fea8a5357a3c3e27e2d2292b1d2";
      const tvl = await api.call({ abi: "uint256:load", target: cap });
      api.add(WEETH_ADDRESS[chain], tvl);
    },
  };
});
