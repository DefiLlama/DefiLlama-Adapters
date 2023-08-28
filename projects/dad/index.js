const sdk = require('@defillama/sdk');
const { unwrapDefiboxLiquidity, } = require("../defibox/utils");
const { get_account_tvl, get_currency_balance } = require("../helper/chain/eos");
const { default: BigNumber } = require("bignumber.js");

async function computeTvl(balances, newBalances = {}) {
  const coingecko = {
    "eos:4,DAPP@dappservices": "dapp",
    'eos:4,EOS@eosio.token': "eos",
  }
  for (const key of Object.keys(balances)) {
    const [chain, extended_symbol] = key.split(":");
    const [symbol, contract] = extended_symbol.split("@");
    const [precision, symbol_code] = symbol.split(",");
    const coingecko_id = coingecko[key];
    if (!coingecko_id) continue; // ignore tokens that are not listed on CoinGecko
    sdk.util.sumSingleBalance(newBalances, coingecko_id, BigNumber(balances[key] / 10 ** precision).toFixed(0));
  }
  return newBalances;
}

module.exports = {
  timetravel: false,
  methodology: `DAD TVL is achieved by querying token balances & unwrapping Defibox liquidity tokens from DAD's vaults`,
  eos: {
    tvl: async () => {
      const balances = {};
      const eosBal = {};
      const accounts = [
        "depositpool1",
        "depositpool2",
        "depositpool3", // contains Defibox LP tokens (BOXVP)
        "depositpool4", // contains Defibox LP tokens (BOXWQ)
        "depositpool5",
        "depositpl111" // contains Defibox LP tokens (BOXAUO)
      ]
      const tokens = [
        ["eosio.token", "EOS", "eos"],
      ];
      const lpTokens = [{
        balance: await get_currency_balance('lptoken.defi', 'depositpool3', 'BOXVP'),
        symbol: 'BOXVP'
      },{
        balance: await get_currency_balance('lptoken.defi', 'depositpool4', 'BOXWQ'),
        symbol: 'BOXWQ'
      },{
        balance: await get_currency_balance('lptoken.defi', 'depositpl111', 'BOXAUO'),
        symbol: 'BOXAUO'
      },]
      await Promise.all(lpTokens.map(i => unwrapDefiboxLiquidity(eosBal, i)))
      await computeTvl(eosBal, balances)
      const allBal = await Promise.all(accounts.map(i => get_account_tvl(i, tokens)))
      for (const bal of allBal)
        Object.entries(bal).forEach(([token, val]) => sdk.util.sumSingleBalance(balances, token, BigNumber(val).toFixed(0)))

      return balances
    }
  },
}