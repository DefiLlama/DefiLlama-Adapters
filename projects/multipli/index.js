const ADDRESSES = require("../helper/coreAssets.json");
const { sumTokens2 } = require("../helper/unwrapLPs");

// Vault and fund-manager addresses verified per issue #19200.
const config = {
  ethereum: {
    owners: ["0xfa5b3614A7C8265E3e8c4f56bC123203BD155ff2"],
    tokens: [ADDRESSES.ethereum.USDC, ADDRESSES.ethereum.USDT, ADDRESSES.ethereum.WBTC],
  },
  base: {
    // Protocol-issued rwaUSDi tokens are excluded by omission from the explicit token lists.
    owners: ["0xed5AA9b6eb62298492c7246FE724ee088A760155"],
    tokens: [ADDRESSES.base.USDC],
  },
  avax: {
    owners: [
      "0xCF0Eb4ac018C06a16ED5c63484823C7805e7599D",
      "0x01e676EAA0C9780A88395c651349Cf08Fe52368e",
      "0x468BbabAEf852C134b584382C0fef83F2954Cd5c",
      "0x62c2181618833b202e68b5addc4279542978Ef47",
    ],

    tokens: [ADDRESSES.avax.USDC, ADDRESSES.avax.BTC_b],
  },
  monad: {
    owners: [
      "0xd74FB32112b1eF5b4C428Fead8dA8d85A0019009",
      "0xE1824bF952bB2E8414d12de8A9fc2cBc666D6758",
    ],
    tokens: [ADDRESSES.monad.USDC],
  },
};

const tvl = async (api) => {
  const { owners, tokens } = config[api.chain];
  return sumTokens2({ api, owners, tokens });
};

module.exports.methodology =
  "TVL is the sum of underlying ERC20 balances (USDC, USDT, WBTC, BTC.b) held at Multipli vault and fund-manager addresses.";
module.exports.timetravel = false;
Object.keys(config).forEach((chain) => {
  module.exports[chain] = { tvl };
});
