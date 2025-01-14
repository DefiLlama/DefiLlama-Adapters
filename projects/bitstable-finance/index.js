const ADDRESS = require("../helper/coreAssets.json");
const { sumTokensExport } = require("../helper/sumTokens");
const sdk = require('@defillama/sdk')
const { sumTokensExport: sumBRC20TokensExport } = require("../helper/chain/brc20");
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')


const BB_STAKE_CONTRACT = '0x8816353DA8A4D45E81C509A54AdbA8E57908958f'
const BB_STAKE_ABI = 'function totalStakedAmount() view returns (uint256)'

const owner = "0x103dd1184599c7511a3016E0a383E11F84AE7173";
const tokens = {
  ethereum: [ADDRESS.ethereum.USDT],
  bsc: [ADDRESS.ethereum.FDUSD],
  bouncebit: [ADDRESS.bouncebit.BBUSD]
};

const bbInBouncebitStaking = async (api) => {
  const staked = await api.call({ target: BB_STAKE_CONTRACT, abi: BB_STAKE_ABI })
  api.addCGToken('bouncebit', staked/1e18)
}

module.exports = {
  methodology: "Staking tokens via BitStable counts as TVL",
  bitcoin: {
    tvl: sdk.util.sumChainTvls([
      // Native(BTC)
      sumTokensExport({ owner: bitcoinAddressBook.bitstable[0] }),
      // BRC20
      sumBRC20TokensExport({
        // Deposit Address
        owner: bitcoinAddressBook.bitstable[1],
        blacklistedTokens: ["BSSB", "DAII"],
      }),
    ]),
    staking: sumBRC20TokensExport({
      // Farm Address
      owner: bitcoinAddressBook.bitstable[2],
      blacklistedTokens: ["DAII"],
    }),
  },
  bouncebit: {
    staking: bbInBouncebitStaking,
  },
};

Object.keys(tokens).map((chain) => {
  module.exports[chain] = {
    tvl: sumTokensExport({ owner, tokens: tokens[chain] }),
  };
});
