// INC contract address on PulseChain
const token = '0x2fa878ab3f87cc1c9737fc071108f904c0b0c95d'

module.exports = {
  methodology: "TVL consists of INC tokens in the protocol on PulseChain",
  pulse: {
    tvl: async (api) => ({
      ["pulse:" + token]: (await api.call({ target: token, abi: "uint256:totalSupply", chain: 'pulse' }))
    })
  }
}; // node test.js projects/inc/index.js