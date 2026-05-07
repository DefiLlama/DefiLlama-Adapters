const { queryContract, endPoints } = require('../helper/chain/cosmos');
const { transformBalances } = require('../helper/portedTokens');
const { get } = require('../helper/http');

const VALDORA_STAKER_CONTRACT = 'zig18nnde5tpn76xj3wm53n0tmuf3q06nruj3p6kdemcllzxqwzkpqzqk7ue55';
const VAULTS_API = 'https://valdora.finance/api/vaults';

async function fetchStakerAUM() {
  const { funds_raised } = await queryContract({
    contract: VALDORA_STAKER_CONTRACT,
    chain: 'zigchain',
    data: { funds_raised: {} },
  });
  if (!funds_raised || funds_raised === '0') return null;
  return funds_raised;
}

async function queryRaw({ contract, key }) {
  const keyB64 = Buffer.from(key).toString('base64');
  const url = `${endPoints.zigchain}/cosmwasm/wasm/v1/contract/${contract}/raw/${keyB64}`;
  const { data } = await get(url);
  if (!data) return null;
  return JSON.parse(Buffer.from(data, 'base64').toString());
}

async function fetchVaultBalance(vaultAddress) {
  const [{ aum }, assetDenom] = await Promise.all([
    queryContract({ contract: vaultAddress, chain: 'zigchain', data: { aum: {} } }),
    queryRaw({ contract: vaultAddress, key: 'asset_denom' }),
  ]);
  return { aum, assetDenom };
}

async function tvl(api) {
  const balances = api.getBalances();

  const stakerAum = await fetchStakerAUM();
  if (stakerAum) balances['zigchain:uzig'] = stakerAum;

  let vaults = [];
  try {
    const payload = await get(VAULTS_API);
    vaults = Array.isArray(payload) ? payload : [];
  } catch (_) {
    vaults = [];
  }
  const results = await Promise.all(
    vaults.map(v => fetchVaultBalance(v.address).catch(() => null))
  );
  for (const r of results) {
    if (!r || !r.aum || !r.assetDenom) continue;
    const key = `zigchain:${r.assetDenom}`;
    balances[key] = (BigInt(balances[key] || 0) + BigInt(r.aum)).toString();
  }

  return transformBalances('zigchain', balances);
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: false,
  methodology: "TVL is the staker contract's funds_raised plus the on-chain AUM of each vault returned by the Valdora vaults API.",
  zigchain: { tvl },
};