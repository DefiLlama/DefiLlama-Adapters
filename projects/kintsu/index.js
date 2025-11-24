const SMON_VAULT_ADDRESS = '0xA3227C5969757783154C60bF0bC1944180ed81B9';
// Use zero address to represent the native token on an EVM chain.
const NATIVE_MON_TOKEN = '0x0000000000000000000000000000000000000000';

async function tvl(api) {
  // Fetch the total pooled MON from the vault contract
  const monadTVL = await api.call({
    abi: 'uint96:totalPooled',
    target: SMON_VAULT_ADDRESS,
  });
  api.add(NATIVE_MON_TOKEN, monadTVL);
}

module.exports = {
  methodology: 'TVL is calculated as total MON under management by sMON vault contract: batched deposits, staked, but excluding MON being unbonded.',
  monad: { tvl },
}
