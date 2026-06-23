const { getTokenMintFromMarketIndex, processSpotPosition, processPerpPosition, getPerpTokenMintFromMarketIndex, getVaultPublicKey, DRIFT_VAULT_PROGRAM_ID, VOLTR_PROGRAM_ID, CUSTOM_PROGRAM_ID } = require("./spotMarkets");
const { deserializeUserPositions, fetchVaultUserAddressesWithOffset, fetchVaultAddresses, fetchPositionAddresses} = require("./helpers");
const { getPerpMarketFundingRates } = require("./spotMarkets");
const { getMultipleAccounts, getProvider, getAssociatedTokenAddress, sumTokens2} = require('../helper/solana');
const { Program } = require("@coral-xyz/anchor");
const { Program : ProgramSerum } = require("@project-serum/anchor");
const voltrIdl = require("./voltr-idl");
const { PublicKey } = require("@solana/web3.js");
const { JLP_MINT, JUP_PERP_PROGRAM_ID } = require("./constant");
const ADDRESSES = require('../helper/coreAssets.json')
const { post } = require('../helper/http');

module.exports = {
  timetravel: false,
  hallmarks: [
    ["2026-04-01", "Drift hack"]
  ],
  doublecounted: true,
  methodology: "Calculate sum of spot positions in vaults with unrealized profit and loss",
  solana: {
    tvl,
  },
};
/**
 * Vault Equity Calculation Formula:
 * VaultEquity = NetSpotValue + UnrealizedPnL
 * 
 * Where:
 * 1. NetSpotValue = Σ(spotPosition.scaledBalance * spotMarketPrice * direction)
 *    - spotPosition.scaledBalance: The size of the spot position
 *    - spotMarketPrice: Current market price of the asset
 *    - direction: 1 for deposits (longs), -1 for borrows (shorts)
 * 
 * 2. UnrealizedPnL = Σ(perpPosition.baseAssetAmount * oraclePrice + perpPosition.quoteAssetAmount + fundingPnL)
 *    For each perpetual position:
 *    - baseAssetAmount * oraclePrice: Current value of the base asset position (e.g., BTC, ETH, SOL)
 *    - quoteAssetAmount: Amount of quote currency (USDC) in the position
 *    - fundingPnL: (market.amm.cumulativeFundingRate - position.lastCumulativeFundingRate) * position.baseAssetAmount / FUNDING_RATE_PRECISION
 * 
 */
async function tvl(api) {
  const [vaultAddresses, positionAddresses] = await Promise.all([
    fetchVaultAddresses(), 
    fetchPositionAddresses()
  ]);
  const voltrVaultAddresses = vaultAddresses.filter(vault => vault.programId === VOLTR_PROGRAM_ID.toBase58());

  // Drift vaults disabled - drift was hacked
  // const driftUserAddresses = positionAddresses.drift ?? []
  // const driftVaultAddresses = vaultAddresses.filter(vault => [DRIFT_VAULT_PROGRAM_ID.toBase58(), CUSTOM_PROGRAM_ID.toBase58()].includes(vault.programId) );
  // const { vaultUserAddresses, } = await fetchVaultUserAddressesWithOffset(driftVaultAddresses, 168);
  // const accounts = await getMultipleAccounts([...vaultUserAddresses, ...driftUserAddresses])
  // ... drift position processing removed ...

  // Voltr vaults
  const provider = getProvider();
  const voltrProgram = new Program(voltrIdl, provider);
  const voltrVaults = await voltrProgram.account.vault.fetchMultiple(voltrVaultAddresses.map(vault => new PublicKey(vault.address)));

  voltrVaults.forEach(vault => {
    const mint = vault.asset.mint.toBase58();
    const balance = vault.asset.totalValue;
    api.add(mint, balance)
  })

  // HyperLoop Prime A
  const idl = await ProgramSerum.fetchIdl(JUP_PERP_PROGRAM_ID, provider);
  const program = new ProgramSerum(idl, JUP_PERP_PROGRAM_ID, provider);
  const jupiterAccounts = await program.account["borrowPosition"].fetchMultiple(
    positionAddresses.jupiter
  );
  for (const account of jupiterAccounts) {
    api.add(JLP_MINT, account.lockedCollateral);
    const BORROW_SIZE_PRECISION = 1000;
    api.add(ADDRESSES.solana.USDC, -account.borrowSize / BORROW_SIZE_PRECISION);
  }

  const tokenAccounts = positionAddresses.solana.map((address) =>
    getAssociatedTokenAddress(ADDRESSES.solana.USDC, address)
  );
  await sumTokens2({ tokenAccounts, api });


  for (const address of positionAddresses.hyperliquid) {
    let hyperliquidData = await post("https://api.hyperliquid.xyz/info", {
      type: "clearinghouseState",
      user: address,
    });
    hyperliquidData = parseInt(hyperliquidData.marginSummary.accountValue);
    api.addCGToken("usd-coin", hyperliquidData);
  }
}

