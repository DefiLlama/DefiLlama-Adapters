const sdk = require('@defillama/sdk');
const utils = require('../helper/utils');
const { sumTokensExport } = require("../helper/chain/cardano");
const { transformBalances } = require('../helper/portedTokens');

const abi = require('./abi.json');
const config = require("./config.json");

async function tvl(chain, chainBlocks) {
  const balances = {};

  const reserve = (await sdk.api.abi.call({
    abi: abi.Djed.reserve, chain: chain, target: config.djedAddress[chain], params: [ 0 ], block: chainBlocks[chain],
  })).output;

  sdk.util.sumSingleBalance(balances, config.reserveTokenAddress[chain], reserve); // Using WADA address instead of mADA
  return transformBalances(chain, balances);
}

async function ergotvl() {
  const {data: { confirmed }} = await utils.fetchURL('https://api.ergoplatform.com/api/v1/addresses/MUbV38YgqHy7XbsoXWF5z7EZm524Ybdwe5p9WDrbhruZRtehkRPT92imXer2eTkjwPDfboa1pR3zb3deVKVq3H7Xt98qcTqLuSBSbHb7izzo5jphEpcnqyKJ2xhmpNPVvmtbdJNdvdopPrHHDBbAGGeW7XYTQwEeoRfosXzcDtiGgw97b2aqjTsNFmZk7khBEQywjYfmoDc9nUCJMZ3vbSspnYo3LarLe55mh2Np8MNJqUN9APA6XkhZCrTTDRZb1B4krgFY1sVMswg2ceqguZRvC9pqt3tUUxmSnB24N6dowfVJKhLXwHPbrkHViBv1AKAJTmEaQW2DN1fRmD9ypXxZk8GXmYtxTtrj3BiunQ4qzUCu1eGzxSREjpkFSi2ATLSSDqUwxtRz639sHM6Lav4axoJNPCHbY8pvuBKUxgnGRex8LEGM8DeEJwaJCaoy8dBw9Lz49nq5mSsXLeoC4xpTUmp47Bh7GAZtwkaNreCu74m9rcZ8Di4w1cmdsiK1NWuDh9pJ2Bv7u3EfcurHFVqCkT3P86JUbKnXeNxCypfrWsFuYNKYqmjsix82g9vWcGMmAcu5nagxD4iET86iE2tMMfZZ5vqZNvntQswJyQqv2Wc6MTh4jQx1q2qJZCQe4QdEK63meTGbZNNKMctHQbp3gRkZYNrBtxQyVtNLR8xEY8zGp85GeQKbb37vqLXxRpGiigAdMe3XZA4hhYPmAAU5hpSMYaRAjtvvMT3bNiHRACGrfjvSsEG9G2zY5in2YWz5X9zXQLGTYRsQ4uNFkYoQRCBdjNxGv6R58Xq74zCgt19TxYZ87gPWxkXpWwTaHogG1eps8WXt8QzwJ9rVx6Vu9a5GjtcGsQxHovWmYixgBU8X9fPNJ9UQhYyAWbjtRSuVBtDAmoV1gCBEPwnYVP5GCGhCocbwoYhZkZjFZy6ws4uxVLid3FxuvhWvQrVEDYp7WRvGXbNdCbcSXnbeTrPMey1WPaXX/balance/total');
  return { ergo: confirmed.nanoErgs / 1e9 };
}

module.exports = {
  methodology: 'The TVL of each Djed deployment is the reserve belonging to the deployment. The TVL within a given blockchain is the sum of the TVLs of all known Djed deployments within that blockchain. The total TVL is the sum of the Djed TVLs on all blockchains.',
  /*ergo:{ //has its own listing under sigmaUSD
    tvl: ergotvl
  },*/
  cardano: {
    tvl: sumTokensExport({ owner: 'addr1z9s3v9vyyctzr4xagvrayw87yvzre6qcq7qw2uvqfznf92qm5kjdmrpmng059yellupyvwgay2v0lz6663swmds7hp0q2jjlf4', tokens: ['lovelace']}),
  },
  /*milkomeda: {
    start: 10440400,
    tvl: (timestamp, block, chainBlocks) => tvl('milkomeda', chainBlocks)
  },*/
};
