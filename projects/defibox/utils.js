const sdk = require('@defillama/sdk');
const axios = require("axios");

const EOS_ENDPOINT = "https://eos.greymass.com";

function defiboxSymbolPairId( symbol ) {
    let id = 0;
    let depth = 0;
    const multiplier = 26
    const chars = symbol.replace(/^BOX/, "").split("").reverse();
    for ( const c of chars ) {
        const value = c.charCodeAt(0) - "A".charCodeAt(0) + 1;
        if ( depth ) id += multiplier ** depth * value
        else id += value;
        depth += 1;
    }
    return id;
  }

function sumDefiboxLiquidity( balances, reserve, token, ratio ) {
  const balance = Number(reserve.split(" ")[0]);
  const precision = Number(token.symbol.split(",")[0]);
  const amount = Math.floor(balance * ratio * 10 ** precision);
  sdk.util.sumSingleBalance( balances, eosTokenString(token), amount );
}

async function unwrapDefiboxLiquidity( balances, token ) {
  const pair_id = defiboxSymbolPairId( token.symbol );
  const data = { code: "swap.defi", scope: "swap.defi", table: "pairs", lower_bound: pair_id, upper_bound: pair_id, json: true };
  const response = await axios.default.post(EOS_ENDPOINT + "/v1/chain/get_table_rows", data);
  if ( response.data.rows ) {
    const { token0, token1, reserve0, reserve1, liquidity_token } = response.data.rows[0];
    const ratio = token.balance / liquidity_token;
    sumDefiboxLiquidity( balances, reserve0, token0, ratio );
    sumDefiboxLiquidity( balances, reserve1, token1, ratio );
  }
}

function eosTokenString( token ) {
  // ex: 4,EOS@eosio.token
  if ( typeof token.contract == 'undefined' ) throw new Error("tokenString: [token.contract] is required");
  if ( typeof token.symbol == 'undefined' ) throw new Error("tokenString: [token.symbol] is required");
  if ( token.symbol.match(",") ) return `eos:${token.symbol}@${token.contract}`
  return `eos:${normalizePrecision(token.precision)},${token.symbol}@${token.contract}`
}

// converts 10000 => 4
function normalizePrecision( precision ) {
  return (String(precision).match(/0/g) || []).length;
}


module.exports = {
  defiboxSymbolPairId,
  sumDefiboxLiquidity,
  unwrapDefiboxLiquidity,
  eosTokenString,
  normalizePrecision
}