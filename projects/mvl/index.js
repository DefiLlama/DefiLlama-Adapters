const { stakings } = require("../helper/staking.js");
const { pool2s } = require("../helper/pool2.js");

const ETH_LP = "0x3c8ad34155b83ddb7f43119a19503d34ed2b5c7a"; // ETH-MVL LP Token
const ETH_SINGLE = "0xA849EaaE994fb86Afa73382e9Bd88c2B6b18Dc71"; // MVL Token
const BSC_LP = "0xE01eDA650632986B2E5B8167F629D7C7c759D4FD"; // BNB-bMVL LP Token
const BSC_SINGLE = "0x5f588EfAf8eB57e3837486e834fC5a4E07768D98"; // bMVL Token

const config = {
  ethereum: {
    token: ETH_SINGLE,
    lp: ETH_LP,
    staking: [
      "0x92Ec27935cE7b523cc70C2fFaf0728F1Fa6425dF",
      "0x1BdFAa7aFAa454F491b5de40d24d681F0F3Adb1A",
    ],
    pool2: [
      "0x34fDA56b5c9Aa52DF9fa51b01666683b7b1434d6",
      "0xC0496C7B9D7150A81bD6fF1d015e95668BD4abeD",
    ],

  },
  bsc: {
    token: BSC_SINGLE,
    lp: BSC_LP,
    staking: [
      "0x0A3AC95445F3e02cC80267f02B9669ed75b71043",
      "0x121E257f4A6fa763012eF0b6b6f68905F6D4b721",
      "0x5a54EC1e6DA36f19a806A9168fD4270fEf697354",
    ],
    pool2: [
      "0xC948622856a40Efd50d74BA6e3624FE7100A95Ef",
      "0xc81632E77Ea7262137EA815DC8BA7a47A5a01ab1",
    ],

  },
};

Object.keys(config).forEach((chain) => {
  const { lp, token, staking, pool2, tvl } = config[chain];
  module.exports[chain] = {
    tvl: () => ({}),
    staking: stakings(staking, token, chain),
    pool2: pool2s(pool2, [lp], chain),
  };
})
module.exports.methodology = "MVL Single Staking TVL is calculated by multiplying the locked MVL quantity by the MVL price that changes in real time. MVL LP Staking TVL is calculated by multiplying the locked LP quantity by the LP price that changes in real time.At this time, the LP price changes depending on the prices of ETH and MVL, and the prices of BNB and bMVL."
