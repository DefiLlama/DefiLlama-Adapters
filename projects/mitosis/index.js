const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

const WEETH_ADDRESS = {
  ethereum: "0xCd5fE23C85820F7B72D0926FC9b05b43E359b7ee",
  arbitrum: "0x35751007a407ca6FEFfE80b3cB397736D2cf4dbe",
  optimism: "0x346e03f8cce9fe01dcb3d0da3e9d00dc2c0e08f0",
  mode: ADDRESSES.blast.weETH,
  manta: "0x77b6F99970f488cFA8bd41892900b6Ce881C2300",
  blast: ADDRESSES.blast.weETH,
  linea: "0x1bf74c010e6320bab11e2e5a532b5ac15e0b8aa6",
  scroll: "0x01f0a31698c4d065659b9bdc21b3610292a1c506",
};

const CAP_ADDRESS = {
  scroll: "0x4a6219E25a41FD4165fbd158D89723a7175EA382",
  ethereum: "0x451d791b6e9a9b8c9237bb55e58a7757342b16f9",
  blast: "0x096430ef0a653c067df32e93ff77090e084169de",
  linea: "0xcd32876b9b483eb75e8ca74935e4b51725f33a91",
};

const vaults = {
  scroll: '0xB9Ca61A6D5fA0c443F3c48Ab1fbf0118964308D6'
}

Object.keys(WEETH_ADDRESS).forEach((chain) => {
  module.exports[chain] = {
    tvl: async (api) => {
      const vault = vaults[chain];
      if (vault) return sumTokens2({ api, owner: vault, tokens: [WEETH_ADDRESS[chain]] })
      const cap =
        CAP_ADDRESS[chain] ?? "0xb883ee478d3b7fea8a5357a3c3e27e2d2292b1d2";
      const tvl = await api.call({ abi: "uint256:load", target: cap });
      api.add(WEETH_ADDRESS[chain], tvl);
    },
  };
});
