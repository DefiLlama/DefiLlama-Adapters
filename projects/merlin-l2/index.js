const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk');
const { sumTokensExport: sumBRC20TokensExport } = require("../helper/chain/brc20");
const { sumTokensExport } = require('../helper/sumTokens');
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

// https://medium.com/@merlinchaincrypto/merlins-seal-the-biggest-fair-launch-of-layer2-5614001b2582
// https://bridge.merlinchain.io/api/v1/token_mapping?after=0&size=100

module.exports = {
  methodology: "Staking tokens via BitStable counts as TVL",
  bitcoin: {
    tvl: sdk.util.sumChainTvls([
      sumTokensExport({ owners: bitcoinAddressBook.merlin }),
      sumBRC20TokensExport({ owners: bitcoinAddressBook.merlin }),
    ]),
  },
  ethereum: {
    tvl: sumTokensExport({
      ownerTokens: [
        [["0x7122985656e38BDC0302Db86685bb972b145bD3C"], "0x147A198d803D4a02b8bEc7CC78be1AbE0C3d93E5",], //sttone
        [[ADDRESSES.ethereum.USDC], "0x8bb6cae3f1cada07dd14ba951e02886ea6bba183",],//usdc
        [[ADDRESSES.null],"0xC40329D3aE56Af6b0757C3fE53941DDCC3d92671",]] //eth
    }),
  },
  arbitrum: {
    tvl: sumTokensExport({
      owners: ["0x8bb6cae3f1cada07dd14ba951e02886ea6bba183",],
      tokens: [ADDRESSES.arbitrum.USDT, ADDRESSES.arbitrum.USDC_CIRCLE] //usdc and usdt
    }),
  },
  zkfair: {
    tvl: sumTokensExport({
      owners: ["0x8E3e71f5c016A3c764D0D0210fF71F15BEa46e3b",],
      tokens: ["0x4b21b980d0Dc7D3C0C6175b0A412694F3A1c7c6b", "0x3f97bf3Cd76B5cA9D4A4E9cD8a73C24E32d6C193", "0x813bCb548F99Bc081e5EFeeAa65e3018befb92Ae",ADDRESSES.null,"0x1cD3E2A23C45A690a18Ed93FD1412543f464158F",] // eth usdt and wbtc and usdc and zkf
    }),
  },
};
