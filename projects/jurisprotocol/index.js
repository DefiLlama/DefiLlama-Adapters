const { get } = require('../helper/http');
const abi = require('./abi.json');
const LCD = process.env.TERRA_LCD || 'https://terra-classic-lcd.publicnode.com';
const { contracts, tokens } = abi;

// Helper: base64 encode JSON for smart queries
function b64(obj) {
  return Buffer.from(JSON.stringify(obj)).toString('base64');
}
async function smartQuery(contract, msgObj) {
  const url = `${LCD}/cosmwasm/wasm/v1/contract/${contract}/smart/${b64(msgObj)}`;
  const res = await get(url);
    console.log(url,'smartQuery')
  return res.data || res.result || res;
}
async function bankBalances(address) {
  const url = `${LCD}/cosmos/bank/v1beta1/balances/${address}?pagination.limit=1000`;
  console.log(url,'bankBalances')
  const res = await get(url);
  return res.balances || [];
}
async function cw20Balance(token, address) {
  const r = await smartQuery(token, { balance: { address } });
  return BigInt((r && r.balance) || (r?.data?.balance) || '0');
}
function nativeBalance(balances, denom) {
  const row = balances.find((x) => x.denom === denom);
  return row ? BigInt(row.amount) : BigInt(0);
}
function addBig(balances, key, amount) {
  if (!amount || amount === '0') return;
  const prev = BigInt(balances[key] || 0);
  balances[key] = (prev + BigInt(amount)).toString();
}


// Core TVL logic using abi.json layout
async function fetchBalances(moduleName) {
  const contractList = Array.isArray(contracts[moduleName]) ? contracts[moduleName].filter(addr => addr && addr.trim() !== '') : [];
  if (!contractList.length) {
    console.log(`[Juris] No contracts found for module: ${moduleName}`);
    return {};
  }

  const tvl = {};
  for (const owner of contractList) {
    for (const [tokenKey, tokenInfo] of Object.entries(tokens)) {
      if (tokenInfo.type === 'cw20') {
        const bal = await cw20Balance(tokenInfo.address, owner);
        addBig(tvl, `terra:${tokenInfo.address}`, bal);
        console.log(`[Juris] Module [${moduleName}] Contract [${owner}] CW20 [${tokenInfo.address}] Balance: ${Number(bal) / Math.pow(10, tokenInfo.decimals || 6)}`);
      }
      if (tokenInfo.type === 'native') {
        const allBank = await bankBalances(owner);
        const bal = nativeBalance(allBank, tokenInfo.address);
        addBig(tvl, tokenInfo.address, bal);
        console.log(`[Juris] Module [${moduleName}] Contract [${owner}] Native [${tokenInfo.address}] Balance: ${Number(bal) / Math.pow(10, tokenInfo.decimals || 6)}`);
      }
    }
  }
  return tvl;
}

// Smart & Dynamic module exports
const terraExport = {};
Object.keys(contracts).forEach(contractKey => {
  if ((contracts[contractKey] || []).some(addr => addr && addr.trim() !== '')) {
    terraExport[contractKey] = async () => await fetchBalances(contractKey);
  }
});
if (Object.keys(terraExport).length > 0) {
  terraExport.tvl = async () => {
    let all = {};
    for (const key of Object.keys(terraExport).filter(k => k !== 'tvl')) {
      const res = await terraExport[key]();
      for (const [token, amount] of Object.entries(res)) {
        if (!all[token]) all[token] = '0';
        all[token] = (BigInt(all[token]) + BigInt(amount)).toString();
      }
    }
    return all;
  };
}

module.exports = {
  methodology: `${abi.protocol.description}. TVL fetched directly from on-chain LCD for each active contract and token in abi.json.`,
  timetravel: false,
  terra: terraExport,
};
