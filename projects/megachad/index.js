const { staking } = require("../helper/staking.js");

const MEGACHAD = '0x374A17bd16B5cD76aaeFC9EAF76aE07e9aF3d888';
const MEGAGOONER = '0x11d819Dbd6e9aF0b13A54e88EA411155764e3F46';
const MC_MG_PAIR = '0x437a433534FF6e7712D7e0A03Fa6CE577EeA1fef';
const MOGGER_STAKING = '0xfd820E6189Eb3396dA71cB072643A0E1e1239853';
const JESTERGOONER = '0x2695965Dd283e2425fab5C4c1E0955656802569c';

/**
 * Compute pool2 TVL: MC/MG LP tokens locked in JESTERGOONER V4, unwrapped
 * into their underlying MEGACHAD + MEGAGOONER reserves.
 *
 * Because MegaChadLP exposes `reserveA` / `reserveB` (not the standard V2
 * `getReserves`), the LP is unwrapped manually:
 *     amountToken = reserve * (lpHeld / lpTotalSupply)
 *
 * Returns early when the pair has zero supply so a freshly deployed pool
 * does not divide by zero.
 *
 * @param {Object} api - DefiLlama SDK chain api bound to `megaeth`.
 * @returns {Promise<void>} Mutates `api` via `api.add` for each underlying token.
 */
async function pool2(api) {
  const [lpHeld, lpTotalSupply, reserveA, reserveB] = await Promise.all([
    api.call({ abi: 'erc20:balanceOf', target: MC_MG_PAIR, params: [JESTERGOONER] }),
    api.call({ abi: 'erc20:totalSupply', target: MC_MG_PAIR }),
    api.call({ abi: 'uint256:reserveA', target: MC_MG_PAIR }),
    api.call({ abi: 'uint256:reserveB', target: MC_MG_PAIR }),
  ]);
  if (lpTotalSupply === '0' || lpTotalSupply === 0n) return;
  const supply = BigInt(lpTotalSupply);
  const held = BigInt(lpHeld);
  api.add(MEGACHAD, (BigInt(reserveA) * held) / supply);
  api.add(MEGAGOONER, (BigInt(reserveB) * held) / supply);
}

module.exports = {
  methodology:
    'Staking counts MEGACHAD locked in MoggerStaking and Pool2 counts MC/MG LP tokens locked in JESTERGOONER V4 (LP staking), resolved to their underlying MEGACHAD + MEGAGOONER reserves.',
  megaeth: {
    tvl: () => ({}),
    staking: staking(MOGGER_STAKING, MEGACHAD),
    pool2,
  },
};
