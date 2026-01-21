const axios = require("axios");

// Creda deposit contract
const DEPOSIT =
  "terra1y6hfmr3lxxj6srduhlfz96x7sga2984pr757a0nrfuqxa9rqxapqcjv4zz";

// CosmosRescue REST (Phoenix-1)
const REST = "https://terra-api.cosmosrescue.dev:8443";

// CW20 tokens
const CW20 = [
  {
    addr: "terra1ecgazyd0waaj3g7l9cmy5gulhxkps2gmxu9ghducvuypjq68mq2s5lvsct",
    key: "coingecko:eris-amplified-luna", // ampLUNA
  },
  {
    addr: "terra1se7rvuerys4kd2snt6vqswh9wugu49vhyzls8ymc02wl37g2p2ms5yz490",
    key: "coingecko:eris-arbitrage-luna", // arbLUNA
  },
];

// native / IBC denom → Coingecko ID
const DENOM_TO_KEY = {
  uluna: "coingecko:terra-luna-2",

  // USDC
  "ibc/2C962DAB9F57FE0921435426AE75196009FAA1981BF86991203C8411F8980FDB":
    "coingecko:ibc-bridged-usdc",

  // WBTC
  "ibc/88386AC48152D48B34B082648DF836F975506F0B57DBBFC10A54213B1BF484CB":
    "coingecko:eureka-bridged-wbtc-terra",

  // PAXG
  "ibc/0EF5630576C66968EF0787868CF09FD866FAD131BC148D24A148358A85F0EB62":
    "coingecko:eureka-bridged-pax-gold-terra",

  // EURE
  "ibc/8D52B251B447B7160421ACFBD50F6B0ABE5F98D2C404B03701130F12044439A1":
    "coingecko:monerium-eur-money-2",

  // wstETH (Axelar)
  "ibc/A356EC90DC3AE43D485514DA7260EDC7ABB5CFAA0654CE2524C739392975AD3C":
    "coingecko:bridged-wrapped-steth-axelar",
};

// ---------- helpers ----------

function add(balances, key, amount) {
  const v = BigInt(amount || "0");
  if (v === 0n) return;
  balances[key] = (balances[key] ?? 0n) + v;
}

function b64json(obj) {
  return Buffer.from(JSON.stringify(obj)).toString("base64");
}

async function getBankBalances(address) {
  const url = `${REST}/cosmos/bank/v1beta1/balances/${address}?pagination.limit=1000`;
  const { data } = await axios.get(url, { timeout: 20000 });
  return data.balances || [];
}

async function cw20Balance(token, owner) {
  const query = b64json({ balance: { address: owner } });
  const url = `${REST}/cosmwasm/wasm/v1/contract/${token}/smart/${query}`;
  const { data } = await axios.get(url, { timeout: 20000 });

  const d = data?.data ?? data;
  return d?.balance ?? d?.result?.balance ?? "0";
}

// ---------- TVL ----------

async function tvl() {
  const balances = {};

  // 1) native / IBC balances
  const bankBalances = await getBankBalances(DEPOSIT);
  for (const { denom, amount } of bankBalances) {
    // excluded amplp
    if (denom.includes("/amplp")) continue;

    const key = DENOM_TO_KEY[denom] ?? `terra2:${denom}`;
    add(balances, key, amount);
  }

  // 2) CW20 balances
  for (const token of CW20) {
    const amt = await cw20Balance(token.addr, DEPOSIT);
    add(balances, token.key, amt);
  }

  // BigInt → string
  const out = {};
  for (const [k, v] of Object.entries(balances)) {
    out[k] = v.toString();
  }

  return out;
}

module.exports = {
  timetravel: true,
  terra2: { tvl },
};
