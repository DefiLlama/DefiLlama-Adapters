const { getTableRows } = require("../helper/chain/proton");

const DEX_CONTRACT = "simpledex";

const tokenMapping = {
  "eosio.token:XPR": "proton",
  "loan.token:LOAN": "proton-loan",
  "xtokens:XUSDC": "usd-coin",
  "xtokens:XUSDT": "tether",
  "xmd.token:XMD": "metal-dollar",
};

function parseSymbol(symStr) {
  const [precision, symbol] = symStr.split(",");
  return { precision: parseInt(precision), symbol };
}

function toDecimal(amount, precision) {
  return Number(amount) / Math.pow(10, precision);
}

async function getAllPools() {
  let allRows = [];
  let lower_bound = "";
  let more = true;

  while (more) {
    const result = await getTableRows({
      code: DEX_CONTRACT,
      scope: DEX_CONTRACT,
      table: "pools",
      limit: 100,
      lower_bound,
    });
    allRows = allRows.concat(result.rows);
    more = result.more;
    if (more) lower_bound = result.next_key;
  }

  return allRows;
}

async function tvl(api) {
  const pools = await getAllPools();

  for (const pool of pools) {
    if (pool.paused) continue;

    const tokenA = parseSymbol(pool.tokenASymbol);
    const tokenB = parseSymbol(pool.tokenBSymbol);
    const reserveA = toDecimal(pool.reserveA, tokenA.precision);
    const reserveB = toDecimal(pool.reserveB, tokenB.precision);

    const cgA = tokenMapping[`${pool.tokenAContract}:${tokenA.symbol}`];
    const cgB = tokenMapping[`${pool.tokenBContract}:${tokenB.symbol}`];

    if (cgA && cgB) {
      api.addCGToken(cgA, reserveA);
      api.addCGToken(cgB, reserveB);
    } else if (cgA) {
      api.addCGToken(cgA, reserveA * 2);
    } else if (cgB) {
      api.addCGToken(cgB, reserveB * 2);
    }
  }
}

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "SimpleDEX TVL is the sum of all liquidity pool reserves.  XPR-paired pools use doubled XPR balances (AMM equal-value invariant) for unknown tokens.",
  proton: {
    tvl,
  },
};
