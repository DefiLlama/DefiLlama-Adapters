module.exports = {
  methodology: "Count supply of KUMA interest-bearing tokens (KIBT)",
};

const allAddresses = {
  ethereum: {
    USK: '0x01bF66BEcDcFD6D59A5Ca18869f494feA086cdfD',
    EGK: '0xf2b5C482358dBaA495d442b57c163dbEDBF7868E'
  },
  polygon: {
    FRK: '0x2cb7285733A30BB08303B917A7a519C88146C6Eb',
    USK: '0xA66818b5bda74c081a9582d8aA8929fae77E214a'
  },
  linea: {
    USK: "0x7a6AA80B49017f3E091574ab5C6977d863ff3865",
  },
  telos: {
    USK: "0x09B88f74Fb9E243c4A3F4D2FfE3d1BA4287a476c",
  }
}

Object.keys(allAddresses).forEach((chain) => {
  const addresses = Object.values(allAddresses[chain]);

  module.exports[chain] = {
    tvl: async (api) => {
      api.addTokens(addresses, await api.multiCall({ abi: 'erc20:totalSupply', calls: addresses }))
    },
  };
});