const { getProvider, getTokenAccountBalances } = require("../helper/solana");
const { Program } = require("@project-serum/anchor");
const { get } = require("../helper/http");
const idl = require("./idl.json");

const PROGRAM_ID = "4nvcyXwTMAqM1ZoZbJWvcPXtg8dNXVbt2CFaXVwaPbT6";
const PYRA_MINT = "9pan9bMn5HatX4EJdBwg9VgCa7Uz5HL8N1m5D3NdXejP";
const PYRA_SOLANA_MINT = "8iHqAtn2z4yi9qrEpm25Qd6NvhoqDmfx19kyz9jCpump";
const PYRA_DECIMALS = 9;

async function tvl(api) {
  const provider = getProvider(api.chain);
  const program = new Program(idl, PROGRAM_ID, provider);
  const pools = await program.account.virtualPool.all();

  const quoteVaults = [];
  for (const { account } of pools) {
    if (account.isMigrated) continue;
    quoteVaults.push(account.quoteVault);
  }

  const balances = await getTokenAccountBalances(quoteVaults, { individual: true, chain: api.chain });
  let totalPyra = 0;
  for (const { amount } of balances) {
    totalPyra += Number(amount);
  }
  totalPyra /= 10 ** PYRA_DECIMALS;

  const priceData = await get(`https://lite-api.jup.ag/price/v3?ids=${PYRA_SOLANA_MINT}`);
  const pyraPrice = priceData[PYRA_SOLANA_MINT].usdPrice;

  // For bonding curves: count PYRA in quote vaults * 2 (base side has roughly equal value)
  api.addUSDValue(totalPyra * pyraPrice * 2);
}

module.exports = {
  timetravel: false,
  isHeavyProtocol: true,
  pyra: { tvl },
  methodology:
    "TVL is calculated by summing PYRA token balances in active bonding curve pools and deriving USD value using Jupiter price feed.",
};
