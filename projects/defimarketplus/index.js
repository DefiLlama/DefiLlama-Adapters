// defimarketplus — non-custodial USD yield vault on Arbitrum.
// https://dmtp.io
//
// TVL = SafeUsdVault.totalAssets() + ProjectTreasury USDC balance.
// The vault's totalAssets() already includes idle USDC + USDC supplied to all
// active strategies (Aave V3 today; Compound V3 + others under governance
// review). Treasury USDC is separately held and earmarked for curated yield
// strategy deployment, so we count it toward TVL as well.

const ADDRESSES = require('../helper/coreAssets.json');

const VAULT = '0x07fF8bCe905CB285220e4D96d8443cfCF141af8b'; // SafeUsdVault (smUSD)
const TREASURY = '0x68d60e869a77ae1ceB546c07F3351e7D899b0Ce3'; // ProjectTreasury

async function tvl(api) {
  const usdc = ADDRESSES.arbitrum.USDC; // canonical Circle USDC

  // Vault's nominal-totalAssets-minus-locked-profit. Includes idle + strategy
  // assets already.
  const vaultAssets = await api.call({
    target: VAULT,
    abi: 'uint256:totalAssets',
  });
  api.add(usdc, vaultAssets);

  // Treasury USDC waiting to be deployed.
  const treasuryUsdc = await api.call({
    target: usdc,
    abi: 'function balanceOf(address) view returns (uint256)',
    params: [TREASURY],
  });
  api.add(usdc, treasuryUsdc);
}

module.exports = {
  methodology:
    'TVL = SafeUsdVault.totalAssets() (idle USDC + USDC deployed to whitelisted lending strategies, minus unvested locked-profit) + USDC held in ProjectTreasury awaiting curated yield deployment.',
  arbitrum: { tvl },
};
