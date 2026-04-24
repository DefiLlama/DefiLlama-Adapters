const SAFE_ADDRESS = '0xe879F812300ee4147247Be0A6CF1338d76645bf2';
const USDC         = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
const A_BASE_USDC  = '0x4e65fE4DbA92790696d040ac24Aa414708F5c0AB';

async function tvl(api) {
  await api.sumTokens({
    owner: SAFE_ADDRESS,
    tokens: [USDC, A_BASE_USDC],
  });
}

module.exports = {
  methodology:
    'TVL is the sum of USDC and aBasUSDC (AAVE v3 Base) held in the ONEPOT Safe multisig. ' +
    'Depositors supply USDC which is lent on AAVE v3. The daily yield buys Megapot lottery ' +
    'tickets. Principal remains intact and is never used to buy tickets.',
  base: { tvl },
};
