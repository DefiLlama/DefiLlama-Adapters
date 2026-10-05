const { get_account_tvl } = require("../helper/chain/eos");

// Alcor Exchange: concentrated liquidity AMM (swap.alcor), orderbook (eostokensdex /
// alcordexmain / alcor) and OTC (alcorotcswap / alcorotc). TVL is what these contracts
// hold. Bridged tokens backed 1:1 (wrap.alcor, eth.token, xtokens, ibc.wt.*) are priced
// as their origin asset.

// https://alcor.exchange/v/eos
async function eos() {
  const accounts = ["swap.alcor", "eostokensdex", "alcorotcswap"];
  const tokens = [
    ["eosio.token", "EOS", "eos"],
    ["core.vaulta", "A", "vaulta"],
    ["tethertether", "USDT", "tether"],
    ["ibc.wt.wax", "WAX", "wax"],
  ];
  return await get_account_tvl(accounts, tokens, "eos");
}

// https://alcor.exchange/v/wax
async function wax() {
  const accounts = ["swap.alcor", "alcordexmain", "alcorotcswap"];
  const tokens = [
    ["eosio.token", "WAX", "wax"],
    ["alien.worlds", "TLM", "alien-worlds"],
    ["token.fusion", "LSWAX", "waxfusion-staked-wax"],
    ["wuffi", "WUF", "wuffi"],
    ["usdt.alcor", "USDT", "alcor-ibc-bridged-usdt-wax"],
    ["wrap.alcor", "USDT", "tether"],
    ["wrap.alcor", "USDC", "usd-coin"],
    ["wrap.alcor", "ETH", "ethereum"],
    ["eth.token", "WAXUSDC", "usd-coin"],
    ["eth.token", "WAXUSDT", "tether"],
    ["eth.token", "WAXWBTC", "wrapped-bitcoin"],
    ["ibc.wt.eos", "EOS", "eos"],
    ["ibc.wt.tlos", "TLOS", "telos"],
  ];
  return await get_account_tvl(accounts, tokens, "wax");
}

// https://alcor.exchange/v/telos
async function telos() {
  const accounts = ["swap.alcor", "eostokensdex", "alcorotcswap"];
  const tokens = [
    ["eosio.token", "TLOS", "telos"],
    ["wrap.alcor", "USDT", "tether"],
    ["wrap.alcor", "USDC", "usd-coin"],
    ["wrap.alcor", "ETH", "ethereum"],
    ["wrap.alcor", "WAX", "wax"],
    ["ibc.wt.eos", "EOS", "eos"],
  ];
  return await get_account_tvl(accounts, tokens, "telos");
}

// https://alcor.exchange/v/proton
async function proton() {
  const accounts = ["swap.alcor", "alcor", "alcorotc"];
  const tokens = [
    ["eosio.token", "XPR", "proton"],
    ["xtokens", "XUSDC", "usd-coin"],
    ["xtokens", "XUSDT", "tether"],
    ["xtokens", "XBTC", "bitcoin"],
    ["xtokens", "XETH", "ethereum"],
    ["xtokens", "XMT", "metal"],
    ["xtokens", "XXRP", "ripple"],
    ["xtokens", "XXLM", "stellar"],
    ["xtokens", "XPAX", "paxos-standard"],
    ["xtokens", "METAL", "metal-blockchain"],
    ["xmd.token", "XMD", "metal-dollar"],
    ["loan.token", "LOAN", "proton-loan"],
  ];
  return await get_account_tvl(accounts, tokens, "proton");
}

module.exports = {
  methodology: `TVL is the token balances of Alcor's AMM (swap.alcor), orderbook and OTC contracts. Bridged tokens backed 1:1 are priced as their origin asset.`,
  eos: { tvl: eos },
  wax: { tvl: wax },
  telos: { tvl: telos },
  proton: { tvl: proton },
}
