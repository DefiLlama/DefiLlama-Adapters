const chains = ["ethereum", "arbitrum", "optimism", "mode", "manta"];

const WEETH_ADDRESS = {
  ethereum: "0xCd5fE23C85820F7B72D0926FC9b05b43E359b7ee",
  arbitrum: "0x35751007a407ca6FEFfE80b3cB397736D2cf4dbe",
  optimism: "0x346e03f8cce9fe01dcb3d0da3e9d00dc2c0e08f0",
  mode: "0x04C0599Ae5A44757c0af6F9eC3b93da8976c150A",
  manta: "0x77b6F99970f488cFA8bd41892900b6Ce881C2300",
};

const CAP_ADDRESS = {
  ethereum: "0x451d791b6e9a9b8c9237bb55e58a7757342b16f9",
};

chains.forEach((chain) => {
  module.exports[chain] = {
    tvl: async (api) => {
      const cap = CAP_ADDRESS[chain] ?? '0xb883ee478d3b7fea8a5357a3c3e27e2d2292b1d2'
      const tvl = await api.call({ abi: 'uint256:load', target: cap, })
      api.add(WEETH_ADDRESS[chain], tvl)
    },
  };
});
