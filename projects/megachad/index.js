// MegaChad — meme-burn + governance protocol on MegaETH (chain 4326)
//
// TVL components:
//   tvl   → reserves of the MEGACHAD/MEGAGOONER AMM pair (MegaChadLP) PLUS
//           MEGACHAD locked in MoggerStaking (Synthetix-style drip rewards)
//   pool2 → MC/MG LP tokens locked in JESTERGOONER V4 (LP staking),
//           unwrapped to their underlying MEGACHAD + MEGAGOONER reserves
//
// The AMM pair (MegaChadLP) uses tokenA/tokenB naming instead of the standard
// Uniswap V2 token0/token1, so pool2 resolves LP holdings manually rather
// than via the generic resolveLP helper.

const MEGACHAD = '0x374A17bd16B5cD76aaeFC9EAF76aE07e9aF3d888';
const MEGAGOONER = '0x11d819Dbd6e9aF0b13A54e88EA411155764e3F46';
const MC_MG_PAIR = '0x437a433534FF6e7712D7e0A03Fa6CE577EeA1fef';
const MOGGER_STAKING = '0xfd820E6189Eb3396dA71cB072643A0E1e1239853';
const JESTERGOONER = '0x2695965Dd283e2425fab5C4c1E0955656802569c';

async function tvl(api) {
  return api.sumTokens({
    ownerTokens: [
      [[MEGACHAD, MEGAGOONER], MC_MG_PAIR],
      [[MEGACHAD], MOGGER_STAKING],
    ],
  });
}

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
    'TVL = reserves of the MEGACHAD/MEGAGOONER AMM pair plus MEGACHAD locked in MoggerStaking. Pool2 = MC/MG LP tokens locked in JESTERGOONER V4 (LP staking), resolved to their underlying MEGACHAD + MEGAGOONER reserves.',
  misrepresentedTokens: true,
  megaeth: {
    tvl,
    pool2,
  },
};
