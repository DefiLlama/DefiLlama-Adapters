const { sumTokens2 } = require('../helper/unwrapLPs');

const factories = ["0xCBD7080c6735E01bc375883DfBC9073e2e587620","0xEB3D17c23e33d908ed80e5CEC419e5f36A5d0F9A"]

const config = {
  ethereum: {
    reserves: factories,
    nftAddress: "0xC36442b4a4522E871399CD717aBDD847Ab11FE88"
  },
  arbitrum: {
    reserves: factories,
    nftAddress: "0xC36442b4a4522E871399CD717aBDD847Ab11FE88"
  },
  bsc: {
    reserves: factories,
    nftAddress: "0x46A15B0b27311cedF172AB29E4f4766fbE7F4364"
  },
  polygon: {
    reserves: factories,
    nftAddress: "0xC36442b4a4522E871399CD717aBDD847Ab11FE88"
  },
  base: {
    reserves: factories,
    nftAddress: "0x03a520b32C04BF3bEEf7BEb72E919cf822Ed34f1"
  },
  optimism: {
    reserves: factories,
    nftAddress: "0xC36442b4a4522E871399CD717aBDD847Ab11FE88"
  },
  avax: {
    reserves: factories,
    nftAddress: "0x655C406EBFa14EE2006250925e54ec43AD184f8B"
  },
  blast: {
    reserves: factories,
    nftAddress: "0xB218e4f7cF0533d4696fDfC419A0023D33345F28"
  },
};

module.exports = {
  methodology: "Only counts assets paired with the created token, and only when using tracked Fair Launch. Does not include other tokens or ejected tokens."
}

Object.keys(config).forEach(chain => {
  const { reserves, nftAddress } = config[chain];

  module.exports[chain] = {
    tvl: async (api) => {
      await sumTokens2({ api, owners: reserves, resolveUniV3: true, uniV3ExtraConfig: { nftAddress } });
      return api.getBalancesV2().getBalances() // Only counting paired assets (like ETH), not the token itself.
    },
  };
});