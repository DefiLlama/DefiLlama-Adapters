// Draft DeFiLlama TVL adapter for ipUSD / IP Vault on Soneium.
// Source contracts: https://github.com/Early-Summer-Studio/ipusd_contract_internal
// Network: Soneium Mainnet (chain id 1868)

const ADDRESS_PROVIDER = '0xe66ACE2989C08efff4663FFA0370dFdD92FD46dB';
const WRAPPER = '0xef63d926A0d15e6e7d96d767665f9312Cb7993C4';
const VAULT = '0x2Ba3FC5BDbBE7BE2630fB71e759739625246bCd9';
const RWA_MANAGER = '0x741a926c6FaE0f357aB0194DcE770767B21D8e31';
const IPUSD_DECIMALS = 6;
const IPUSD_SCALE = 10 ** IPUSD_DECIMALS;
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

function isZeroAddress(address) {
  return !address || address.toLowerCase() === ZERO_ADDRESS;
}

function asBigInt(value) {
  return BigInt(value.toString());
}

async function tvl(api) {
  // Read the canonical collateral-token addresses from the onchain AddressProvider.
  const [usdc, usdsc] = await Promise.all([
    api.call({ target: ADDRESS_PROVIDER, abi: 'address:USDC' }),
    api.call({ target: ADDRESS_PROVIDER, abi: 'address:USDSC' }),
  ]);

  if (isZeroAddress(usdc) || isZeroAddress(usdsc)) {
    throw new Error(`AddressProvider returned a zero collateral token: USDC=${usdc}, USDSC=${usdsc}`);
  }

  // Count actual collateral held by the wrapper. The SDK prices these tokens by address.
  const collateralTokens = [...new Set([usdc, usdsc].map((a) => a.toLowerCase()))];
  const tokenAddressByLower = new Map([[usdc.toLowerCase(), usdc], [usdsc.toLowerCase(), usdsc]]);
  const wrapperBalances = await api.multiCall({
    abi: 'erc20:balanceOf',
    calls: collateralTokens.map((token) => ({
      target: tokenAddressByLower.get(token),
      params: [WRAPPER],
    })),
  });

  for (let i = 0; i < collateralTokens.length; i++) {
    const balance = wrapperBalances[i];
    if (asBigInt(balance) > 0n) {
      api.add(tokenAddressByLower.get(collateralTokens[i]), balance);
    }
  }

  // Dynamically discover RWA assets; the list is append-only in RwaManager.
  const rwaTokens = await api.call({
    target: RWA_MANAGER,
    abi: 'function rwaTokens() view returns (address[])',
  });
  if (!rwaTokens || rwaTokens.length === 0) return api.getBalances();

  const [enabled, accounted, actualBalances] = await Promise.all([
    api.multiCall({
      abi: 'function isEnabled(address) view returns (bool)',
      calls: rwaTokens.map((token) => ({ target: RWA_MANAGER, params: [token] })),
    }),
    api.multiCall({
      abi: 'function accountedRwa(address) view returns (uint256)',
      calls: rwaTokens.map((token) => ({ target: VAULT, params: [token] })),
    }),
    api.multiCall({
      abi: 'erc20:balanceOf',
      calls: rwaTokens.map((token) => ({ target: token, params: [VAULT] })),
    }),
  ]);

  const quoteCalls = [];
  for (let i = 0; i < rwaTokens.length; i++) {
    if (!enabled[i]) continue;
    const accountedUnits = asBigInt(accounted[i]);
    const actualUnits = asBigInt(actualBalances[i]);
    // Match RoyaltyVault._heldAccounted(): use min(accountedRwa, actual ERC-20 balance).
    const heldUnits = accountedUnits < actualUnits ? accountedUnits : actualUnits;
    if (heldUnits === 0n) continue;
    quoteCalls.push({ target: RWA_MANAGER, params: [rwaTokens[i], heldUnits.toString()] });
  }

  if (quoteCalls.length > 0) {
    // quoteLenient returns a value denominated in ipUSD base units (ipUSD has 6 decimals).
    // This uses the protocol's own onchain RWA oracle/NAV convention, at USD parity for ipUSD.
    const quotedValues = await api.multiCall({
      abi: 'function quoteLenient(address,uint256) view returns (uint256)',
      calls: quoteCalls,
    });
    for (let i = 0; i < quotedValues.length; i++) {
      const raw = asBigInt(quotedValues[i]);
      if (raw === 0n) {
        throw new Error(
          `Enabled RWA ${quoteCalls[i].params[0]} has a positive accounted holding but quoteLenient returned zero; refusing to silently understate TVL.`,
        );
      }
      const usdValue = Number(raw) / IPUSD_SCALE;
      if (!Number.isFinite(usdValue)) throw new Error(`Non-finite RWA USD value from quoteLenient: ${raw}`);
      api.addUSDValue(usdValue);
    }
  }

  return api.getBalances();
}

module.exports = {
  // Wrapper Proxy was deployed at block 29,828,004 (2026-10-23 21:25:59 UTC).
  // start uses the earliest date on which this adapter can report its counted assets.
  start: '2026-10-24',
  methodology:
    'Counts USDC and USDSC actually held by IPUSDWrapper, plus enabled and accounted RWA positions actually held by RoyaltyVault valued through RwaManager.quoteLenient. Excludes internal ipUSD balances, outstanding extraction face values, and sipUSD shares to avoid counting claims on the same assets twice. RWA values use the protocol oracle and ipUSD USD-parity accounting convention.',
  soneium: { tvl },
};
