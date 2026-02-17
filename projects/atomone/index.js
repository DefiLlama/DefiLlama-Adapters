const API_URL = "https://atomone-api.allinbits.com";
const ATONE_COINGECKO = "coingecko:atomone";
const ATONE_DECIMALS = 10n ** 6n; // 1 ATONE = 1,000,000 uatone

async function tvl() {
  const res = await fetch(`${API_URL}/cosmos/staking/v1beta1/pool`);
  const data = await res.json();

  const bondedStr = data?.pool?.bonded_tokens;
  if (!bondedStr) return {};

  const bonded = BigInt(bondedStr);
  const atone = Number(bonded) / Number(ATONE_DECIMALS);

  return { [ATONE_COINGECKO]: atone };
}

module.exports = {
  timetravel: false,
  methodology:
    "Counts total ATONE bonded",
  atomone: { tvl },
};

