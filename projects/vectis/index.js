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
  const driftUserAddresses = positionAddresses.drift ?? []

  const driftVaultAddresses = vaultAddresses.filter(vault => [DRIFT_VAULT_PROGRAM_ID.toBase58(), CUSTOM_PROGRAM_ID.toBase58()].includes(vault.programId) );
  const voltrVaultAddresses = vaultAddresses.filter(vault => vault.programId === VOLTR_PROGRAM_ID.toBase58());

  const { vaultUserAddresses, } = await fetchVaultUserAddressesWithOffset(driftVaultAddresses, 168);

  // Get all vault accounts first
  const accounts = await getMultipleAccounts([...vaultUserAddresses, ...driftUserAddresses])
  const deserializedData = accounts.filter((accountInfo) => !!accountInfo).map(deserializeUserPositions)

  // Collect unique market indices upfront
  const allSpotIndices = new Set()
  const allPerpIndices = new Set()
  
  deserializedData.forEach(({ spotPositions, perpPositions }) => {
    spotPositions?.forEach(pos => allSpotIndices.add(pos.market_index))
    perpPositions?.forEach(pos => allPerpIndices.add(pos.market_index))
  })

  // Batch fetch 
  const allKeys = [
    ...[...allSpotIndices].map(index => getVaultPublicKey('spot_market', index)),
    ...[...allPerpIndices].map(index => getVaultPublicKey('perp_market', index)),
  ]
  
  const allAccounts = await getMultipleAccounts(allKeys)
  
  // Create lookup maps
  const spotAccountMap = {}
  const perpAccountMap = {}
  
  let offset = 0
  ;[...allSpotIndices].forEach((index, i) => {
    spotAccountMap[index] = allAccounts[i]
    offset = i + 1
  })
  ;[...allPerpIndices].forEach((index, i) => {
    perpAccountMap[index] = allAccounts[i + offset]
  })

  // Process positions using the cached account data
  for (const { spotPositions, perpPositions } of deserializedData) {
    if (spotPositions?.length) {
      spotPositions.forEach(position => {
        const tokenMint = getTokenMintFromMarketIndex(position.market_index)
        const adjustedBalance = processSpotPosition(position, spotAccountMap[position.market_index])
        api.add(tokenMint, adjustedBalance)
      })
    }

    if (perpPositions?.length) {
      perpPositions.map(position => {
        const baseTokenMint = getPerpTokenMintFromMarketIndex(position.market_index)
        const { baseBalance, quoteBalance } = processPerpPosition(position)
        api.add(baseTokenMint, baseBalance)

        const quoteTokenMint = getTokenMintFromMarketIndex(0)
        api.add(quoteTokenMint, quoteBalance)

        const { cumulativeFundingRateLong, cumulativeFundingRateShort } = getPerpMarketFundingRates(perpAccountMap[position.market_index])
        const currentCumulativeFundingRate = position.base_asset_amount > 0n ? cumulativeFundingRateLong : cumulativeFundingRateShort
        const difference = (currentCumulativeFundingRate - BigInt(position.last_cumulative_funding_rate)) / BigInt(10 ** 6)
        const fundingRatePnl = (difference * (position.base_asset_amount) / BigInt(10 ** 6))
        api.add(quoteTokenMint, fundingRatePnl)
      })
    }
  }

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

