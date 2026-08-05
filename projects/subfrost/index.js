const { sumTokens } = require("../helper/sumTokens");
const ADDRESSES = require("../helper/coreAssets.json");
const bitcoinAddressBook = require("../helper/bitcoin-book/index.js");

// SUBFROST is a decentralized signing network on Bitcoin L1. It issues frBTC, a
// synthetic bitcoin pegged 1:1 to BTC, against BTC held by a FROST signer set. frBTC
// is issued on two Bitcoin metaprotocols, Alkanes and BRC2.0, each with its own
// custody address.
const owners = bitcoinAddressBook.subfrost;

// SUBFROST also issues frUSD, a dollar asset on Alkanes, against USDC/USDT
// deposited in this vault on Ethereum.
//
// The value is reported on ethereum, where the collateral actually sits, and the
// frUSD minted against it is not counted again. That follows the same convention
// as the bitcoin leg above and as WBTC/tBTC, which report against the chain
// holding the deposits rather than the chain the representation is issued on.
const FRUSD_VAULT = "0x95779e7e1c943042255b8a78273fe6de4823cf06";

async function bitcoinTvl(api) {
  return sumTokens({ owners, api });
}

async function ethereumTvl(api) {
  return api.sumTokens({
    owner: FRUSD_VAULT,
    tokens: [ADDRESSES.ethereum.USDC, ADDRESSES.ethereum.USDT],
  });
}

module.exports = {
  bitcoin: { tvl: bitcoinTvl },
  ethereum: { tvl: ethereumTvl },
  methodology: `Total value of the collateral held by the transparent and verifiable SUBFROST signing group. On bitcoin, all BTC backing frBTC across both deployments, Alkanes and BRC2.0. On ethereum, the USDC and USDT held in the frUSD vault. The frBTC and frUSD minted against these deposits are not counted separately, so nothing is double counted.`,
};
