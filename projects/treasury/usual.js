const ADDRESSES = require('../helper/coreAssets.json')
const { treasuryExports } = require("../helper/treasury");

const bUSD0  = "0x35d8949372d46b7a3d5a56006ae77b215fc69bc0";
const tokens = [
  '0x259338656198ec7a76c729514d3cb45dfbf768a1', // Resolv
  '0xd001f0a15d272542687b2677ba627f48a4333b5d', // e-USD0
  '0xf8094570485b124b4f2abe98909a87511489c162', // PENDLE-LPT
  '0xb4cd5c5440eb69edb6db878ca2acd7c6b97b2ba5', // YT-USD0++-27NOV2025
  '0xd2245ee5c3099d65a3d0fdceca0f71cc4aa8f0ff', // fSL23
  '0x8092ca384d44260ea4feaf7457b629b8dc6f88f0', // ustUSR++
  '0x28d24d4380b26a1ef305ad8d8db258159e472f33', // Usual_MV
  bUSD0, // formerlyUSD0++
  '0x2e7fc02be94bc7f0cd69dcab572f64bcc173cd81', // USD0a
  ADDRESSES.ethereum.USD0, // USD0
  ADDRESSES.ethereum.USDC, // USDC
  ADDRESSES.ethereum.WETH, // WETH
  '0x58d97b57bb95320f9a05dc918aef65434969c2b2', // morpho
  '0x734eec7930bc84ec5732022b9eb949a81fb89abe', // ETH0
  '0x3c89cd1884e7bef73ca3ef08d2ef6ec338fd8e49', // EUR0
  '0xc4441c2be5d8fa8126822b9929ca0b81ea0de38e', // USUAL
  '0x437cc33344a0b27a429f795ff6b469c72698b291', // wM
  '0xc139190f447e929f090edeb554d95abb8b18ac1c', // USDtb
  '0xaf87b90e8a3035905697e07bb813d2d59d2b0951', // uTac
  '0x77633305032b6bdf3ebdb373b3badccb2786ce2f', // EVK Vault eUSD0-6
  '0x5cd97d97d311f9de388c1c110b10bf81aad7caf0', // Bunni USD0 - USD0++
  '0x749794e985af5a9a384b9cee6d88dab4ce1576a1', // MEVCapital USD0
  '0xa0769f7a8fc65e47de93797b4e21c073c117fc80', // euTBL
  '0x1abaea1f7c830bd89acc67ec4af516284b1bc33c', // EURC
  ADDRESSES.ethereum.WSTETH // wstEth
]
 
const owners = [
  '0xF3D913De4B23ddB9CfdFAF955BAC5634CbAE95F4', // longterm Treasury 
  '0x81ad394C0Fa87e99Ca46E1aca093BEe020f203f4', // Yield Treasury  
  '0xc32e2a2F03d41768095e67b62C9c739f2C2Bc4aA', // Treasury 1
  '0xe3FD5A2cA538904A9e967CBd9e64518369e5a03f', // Treasury 2
  '0xcbf85D44178c01765Ab32Af72D5E291dcd39A06B', // Treasury 3     
 // '0x28E52d338Aa22Ab3e2331b65291C871B6fd6e517', // LP Holdings
]
const lendingMarketGetUserPositionAbi = "function getUserPosition(tuple(address, address,address, address,uint256,uint256,address), address) view returns (uint256 supplyAssets, uint256 supplyShares, uint256 borrowAssets, uint256 borrowShares, uint256 collateralAssets)";
const firaLendingMarket= "0xa428723ee8ffd87088c36121d72100b43f11fb6a";
const UZRMarketParams = ["0x73A15FeD60Bf67631dC6cd7Bc5B6e8da8190aCF5", "0x35D8949372D46B7a3D5A56006AE77B215fc69bC0" ,"0x30Da78355FcEA04D1fa34AF3c318BE203C6F2145","0xdfCF197B0B65066183b04B88d50ACDC0C4b01385","880000000000000000","999900000000000000" ,"0xFE7C47895eDb12a990b311Df33B90Cfea1D44c24"];

// Vaults that need to be priced via convertToAssets 
const VAULTS = [
  "0xBEEf050ecd6a16c4e7bfFbB52Ebba7846C4b8cD4", // Steakhouse ETH
  "0x67ec31a47a4126A66C7bb2fE017308cf5832A4Db", // usUSDS++ 
  "0x8245FD9Ae99A482dFe76576dd4298f799c041D61", // uUSCC++ 
  "0xFE7C47895eDb12a990b311Df33B90Cfea1D44c24", // Fira UZR  
]

 
// Aave HORIZON V3 addresses (Ethereum mainnet)
const AAVE_HORIZON_POOL = "0xAe05Cd22df81871bc7cC2a04BeCfb516bFe332C8"; // Aave Horizon Pool
const aaveUserReserveDataAbi = "function getUserAccountData(address user) view returns (uint256 totalCollateralBase, uint256 totalDebtBase, uint256 availableBorrowsBase, uint256 currentLiquidationThreshold, uint256 ltv, uint256 healthFactor)";

 

const base =  treasuryExports({
  ethereum: {
    tokens,
    owners,
    ownTokens: ["0x06B964d96f5dCF7Eae9d7C559B09EDCe244d4B8E", "0xC4441c2BE5d8fA8126822B9929CA0b81Ea0DE38E" ], // USUALX and USUAL 
    resolveUniV3: true,
    resolveLP: true, 
    fetchCoValentTokens: true,
  }
});
const baseTvl = base.ethereum.tvl


base.ethereum.tvl = async (api) => {
  // 1. Run existing treasury logic (standard ERC20 + LPs + UniV3)
  await baseTvl(api)

  // 2. Add Fira position
  let calls = []
  owners.forEach(owner => {
      calls.push({ target: firaLendingMarket, params: [UZRMarketParams, owner] })
  })
  // add collateral and subtract borrowed amount
  const positions = await api.multiCall({ abi: lendingMarketGetUserPositionAbi, calls: calls }) 
  positions.forEach(position => {
    api.add(bUSD0, position.collateralAssets)
    api.add(ADDRESSES.ethereum.USD0,-BigInt(position.borrowAssets) )
  })


   // 3. Handle unpriced vaults (Morpho/ERC4626)
  // Step A: Get balances of vault tokens across all owners
  calls = []
  owners.forEach(owner => {
    VAULTS.forEach(vault => {
      calls.push({ target: vault, params: owner })
    })
  })
  const vaultBalances = await api.multiCall({ abi: 'erc20:balanceOf', calls })
  const vaultAssets = await api.multiCall({ abi: 'function asset() view returns (address)', calls: VAULTS.map(vault => ({ target: vault })) })
  // it needs to be an object with the vault as the key and the asset as the value
  const vaultToAsset= Object.fromEntries(vaultAssets.map((asset, i) => [VAULTS[i], asset])) 
  // add vaultAssets to calls 
  calls.forEach((call, i) => {
    call.asset = vaultToAsset[call.target] 
  })
  
  // Step B: Filter for non-zero balances to query convertToAssets
  const activeVaultCalls = []
  vaultBalances.forEach((bal, i) => {
    if (bal > 0) {
      activeVaultCalls.push({
        target: calls[i].target,
        params: bal, // convertToAssets takes the share amount as input
        asset: calls[i].asset
      })
    }
  })
  // Step C: Convert shares to assets (ETH)
  if (activeVaultCalls.length > 0) {
    const underlyingAssets = await api.multiCall({
      abi: 'function convertToAssets(uint256) view returns (uint256)',
      calls: activeVaultCalls
    })
    underlyingAssets.forEach((amount, i) => api.add(activeVaultCalls[i].asset, amount))
  }

  // 4. Add Aave position 
  calls = []
  owners.forEach(owner => { 
      calls.push({ target: AAVE_HORIZON_POOL, params: owner }) 
  })

  // Get all Aave positions
  const aavePositions = await api.multiCall({ abi: aaveUserReserveDataAbi, calls: calls })
 
  // Process positions: add supplied assets, subtract borrowed assets
  // NOTE: Aave returns values in USD base currency with 8 decimals
  // Convert from 8 decimals to actual USD value and add directly
  const DECIMALS_8 = 10n ** 8n
  aavePositions.forEach((position, i) => {
    const supplied = BigInt(position.totalCollateralBase)
    const borrowed = BigInt(position.totalDebtBase)
    
    if (supplied > 0) {
      // Convert from 8 decimals to USD value
      const suppliedUSD = supplied / DECIMALS_8
      api.addUSDValue(Number(suppliedUSD ))
    }
    if (borrowed > 0) {
      const borrowedUSD = borrowed / DECIMALS_8
      api.addUSDValue(-1 * Number(borrowedUSD ))
    }
  })
}

module.exports = base;