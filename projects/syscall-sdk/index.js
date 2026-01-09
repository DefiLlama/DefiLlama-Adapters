const { sumTokensExport } = require('../helper/unwrapLPs');

// Syscall-SDK Gateway Contract
const SYSCALL_CONTRACT = "0xA8Bdb75FaeE825c24A3DCEE870cd415773B31a8f";

module.exports = {
  methodology: "Counts the native token (Gas/ETH) balance deposited in the Syscall-SDK contract, intended to fund off-chain actions.",
  megaeth: {
    tvl: sumTokensExport({ 
        owner: SYSCALL_CONTRACT, 
        tokens: [
            "0x0000000000000000000000000000000000000000" // Null address = Native ETH
        ]
    })
  }
};
