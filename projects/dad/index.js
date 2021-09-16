const axios = require("axios");
const sdk = require('@defillama/sdk');
const utils = require('../helper/utils');
const { unwrapDefiboxLiquidity, eosTokenString } = require("../defibox/utils");

const EOSFLARE_ENDPOINT = "https://api.eosflare.io";

async function getAccountBalances( balances, account ) {
  const response = await axios.default.post(EOSFLARE_ENDPOINT + "/v1/eosflare/get_account", {account});

  // sum EOS
  const { balance_total, tokens } = response.data.account;
  const EOS = { symbol: "4,EOS", contract: "eosio.token" }
  sdk.util.sumSingleBalance(balances, eosTokenString(EOS), Math.floor(balance_total * 10 ** 4) );

  // sum alt tokens
  for ( const token of tokens ) {
    if ( !token.balance ) continue;
    if ( token.contract == "lptoken.defi" ) await unwrapDefiboxLiquidity( balances, token ); // unwrap LP tokens
    else sdk.util.sumSingleBalance(balances, eosTokenString(token), Math.floor(token.balance * token.precision) );
  }
}

async function getSimplePrice( id, currency = "usd" ) {
  const response = await utils.fetchURL(`https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=${currency}`)
  if ( response.data ) return response.data[id].usd;
  return 0;
}

async function computeTvl( balances ) {
  let tvl = 0;
  const coingecko = {
    "eos:4,DAPP@dappservices": "dapp",
    'eos:4,EOS@eosio.token': "eos",
  }
  for ( const key of Object.keys(balances) ) {
    const [ chain, extended_symbol ] = key.split(":");
    const [ symbol, contract ] = extended_symbol.split("@");
    const [ precision, symbol_code ] = symbol.split(",");
    const coingecko_id = coingecko[key];
    if ( !coingecko_id ) continue; // ignore tokens that are not listed on CoinGecko
    const price = await getSimplePrice(coingecko_id);
    tvl += (balances[key] / 10 ** precision) * price;
  }
  return tvl;
}

async function timeout(ms) {
  return new Promise(resolve => setTimeout(() => resolve(), ms))
}

// https://superdad.finance/
// Staking Pools
async function tvl() {
  const balances = {};
  const accounts = [
    "depositpool1",
    "depositpool2",
    "depositpool3", // contains Defibox LP tokens (BOXVP)
    "depositpool4", // contains Defibox LP tokens (BOXWQ)
    "depositpool5",
    "depositpl111" // contains Defibox LP tokens (BOXAUO)
  ]
  for ( const account of accounts ) {
    await getAccountBalances(balances, account);
    await timeout(3000); // timeout 3s (EOSFlare rate limits)
  }
  return await computeTvl( balances );
}

module.exports = {
  methodology: `DAD TVL is achieved by querying token balances & unwrapping Defibox liquidity tokens from DAD's vaults via https://eosflare.io/api and https://defibox.io/.`,
  tvl
}