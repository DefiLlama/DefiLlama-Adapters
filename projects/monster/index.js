const { pool2 } = require('../helper/pool2')
const { staking } = require('../helper/staking')
const MST_TOKEN_CONTRACT = "0x152888854378201e173490956085c711f1DeD565";
const VE_CONTRACT = "0xc8034b3dF18Ea4d607E86D6b6Bf23E2A8Ed70F89";
const LP_POOL_1 = "0x1a88e447c7468b28de490b25a076a4ffc0c68b16";
const LP_STAKING_1 = "0x06bFdfF7366DE711F363105F446f8399663db749";
const LP_POOL_2 = "0x1f5c5b104d6246B3d096135806cd6C6e53e206F1";
const LP_STAKING_2 = "0xc13926C5CB2636a29381Da874b1e2686163DC226";

module.exports = {
      methodology:
    "counts the number of MST tokens in the ve contract and the pairs in the staking pool",
  start: 22569995,
  fantom: {
    tvl: async () => ({}),
    pool2: pool2([LP_STAKING_1, LP_STAKING_2], [LP_POOL_1, LP_POOL_2]),
    staking: staking(VE_CONTRACT, MST_TOKEN_CONTRACT),
  },
};
