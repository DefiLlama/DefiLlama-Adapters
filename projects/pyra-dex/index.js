const { getProvider, getTokenAccountBalances } = require("../helper/solana");
const { Program } = require("@project-serum/anchor");
const { get } = require("../helper/http");
const idl = require("./idl.json");

const PROGRAM_ID = "94jkbjHAz6oVCsbsDKpeBRZZYvhm2Hg2epNDihLmb4nN";
const PYRA_MINT = "9pan9bMn5HatX4EJdBwg9VgCa7Uz5HL8N1m5D3NdXejP";
const PYRA_SOLANA_MINT = "8iHqAtn2z4yi9qrEpm25Qd6NvhoqDmfx19kyz9jCpump";
const PYRA_DECIMALS = 9;

async function tvl(api) {
  const provider = getProvider(api.chain);
  const program = new Program(idl, PROGRAM_ID, provider);
  const pools = await program.account.pool.all();

  const pyraVaults = [];
  for (const { account } of pools) {
    const isPyraA = account.tokenAMint.toString() === PYRA_MINT;
    pyraVaults.push(isPyraA ? account.tokenAVault : account.tokenBVault);
  }

  const balances = await getTokenAccountBalances(pyraVaults, { individual: true, chain: api.chain });
  let totalPyra = 0;
  for (const { amount } of balances) {
    totalPyra += Number(amount);
  }
  totalPyra /= 10 ** PYRA_DECIMALS;

  const priceData = await get(`https://lite-api.jup.ag/price/v3?ids=${PYRA_SOLANA_MINT}`);
  const pyraPrice = priceData[PYRA_SOLANA_MINT].usdPrice;

  // TVL ≈ 2 * PYRA_balance * price (both sides of AMM pool are roughly equal in value)
  api.addUSDValue(totalPyra * pyraPrice * 2);
}

module.exports = {
  timetravel: false,
  isHeavyProtocol: true,
  pyra: { tvl },
  methodology:
    "TVL is calculated by summing PYRA token balances in all DEX pool vaults and deriving USD value using Jupiter price feed.",
};
