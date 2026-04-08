const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport, nullAddress } = require("../helper/sumTokens");

const SWAP_PROXY = ["0x37CCd90ed5FA96207B41C4fBCB90b883e30e63DC"];

const SUPPORTED_ASSETS = [
  ADDRESSES.eni.USDT_1,
  ADDRESSES.eni.USDT_2,
  ADDRESSES.eni.USDT,
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