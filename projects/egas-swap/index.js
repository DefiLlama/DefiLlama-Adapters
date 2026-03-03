const { sumTokensExport, nullAddress } = require("../helper/sumTokens");

const SWAP_PROXY = ["0x37CCd90ed5FA96207B41C4fBCB90b883e30e63DC"];

const SUPPORTED_ASSETS = [
  "0x47c98f74dBC1acc4cf2e04C4a729E22379EF4373",
  "0x545e289b88c6d97b74ec0b96e308cae46bf5f832",
  "0xdc1a8a35b0baa3229b13f348ed708a2fd50b5e3a",
];

module.exports = {
  methodology:
    "TVL is calculated as the total on-chain assets held by the EGAS Swap proxy contract. " +
    "It includes balances of all supported ERC20 swap assets held by the proxy and the chain's native gas token (EGAS) held by the proxy (tracked via nullAddress). ",
  eni: {
    tvl: sumTokensExport({
      owners: SWAP_PROXY,
      tokens: [
        ...SUPPORTED_ASSETS,
        nullAddress,
      ],
    }),
  },
};