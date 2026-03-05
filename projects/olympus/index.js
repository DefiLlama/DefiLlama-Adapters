/**
 * Olympus (Omega DEX) TVL adapter for DefiLlama.
 * Chain: Omega Network (chainId 1313161916, shortName "omega").
 * TVL = PRE + mUSDC in the market maker wallet used for the PRE/mUSDC pair.
 */

const PRE_OMEGA = "0xB8149d86Fb75C9A7e3797d6923c12e5076b6AEd9";
const MUSDC_OMEGA = "0x24A4704dE79819e4Dcb379cC548426F03f663b09";
const MM_WALLET = "0x32Be343B94f860124dC4fEe278FDCBD38C102D88";

async function tvl(api) {
  const [preBal, musdcBal] = await Promise.all([
    api.call({ abi: "erc20:balanceOf", target: PRE_OMEGA, params: [MM_WALLET] }),
    api.call({ abi: "erc20:balanceOf", target: MUSDC_OMEGA, params: [MM_WALLET] }),
  ]);
  api.add(PRE_OMEGA, preBal);
  api.add(MUSDC_OMEGA, musdcBal);
}

module.exports = {
  methodology: "TVL is the sum of PRE and mUSDC held in the Olympus market maker wallet for the PRE/mUSDC pair on Omega Network.",
  omega: {
    tvl,
  },
};
