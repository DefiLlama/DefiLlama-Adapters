const { getConfig } = require('../helper/cache');
const ADDRESSES = require('../helper/coreAssets.json');

const API_URL = 'https://api.yieldseeker.xyz/v1/agent-analytics';

// ERC4626 vaults held by YieldSeeker agents — shares are unwrapped to underlying on-chain
const ERC4626_VAULTS = [
  // Morpho MetaMorpho vaults
  '0xeE8F4eC5672F09119b96Ab6fB59C27E1b7e44b61', // Gauntlet USDC Prime
  '0xdB90A4e973B7663ce0Ccc32B6FbD37ffb19BfA83', // Degen USDC
  '0xcdDCDd18A16ED441F6CB10c3909e5e7ec2B9e8f3', // Apostro Resolv USDC
  '0xCd347c1e7d600a9A3e403497562eDd0A7Bc3Ef21', // Ionic Ecosystem USDC
  '0xc1256Ae5FF1cf2719D4937adb3bbCCab2E00A2Ca', // Moonwell Flagship USDC
  '0xc0c5689e6f4D256E861F65465b691aeEcC0dEb12', // Gauntlet USDC Core
  '0xBeeFa74640a5f7c28966cbA82466EED5609444E0', // Smokehouse USDC
  '0xbeeF010f9cb27031ad51e3333f9aF9C6B1228183', // Steakhouse USDC
  '0xBEEFE94c8aD530842bfE7d8B397938fFc1cb83b2', // Steakhouse Prime USDC
  '0xBEEFA7B88064FeEF0cEe02AAeBBd95D30df3878F', // Steakhouse High Yield USDC
  '0xE1bA476304255353aEF290e6474A417D06e7b773', // Moonwell Ecosystem USDC
  '0xB7890CEE6CF4792cdCC13489D36D9d42726ab863', // Universal USDC
  '0x7BfA7C4f149E7415b73bdeDfe609237e29CBF34A', // Spark USDC Vault (Morpho)
  '0x616a4E1db48e22028f6bbf20444Cd3b8e3273738', // Seamless USDC Vault
  '0x23479229e52Ab6aaD312D0B03DF9F33B46753B5e', // Extrafi XLend USDC
  '0x1D3b1Cd0a0f242d598834b3F2d126dC6bd774657', // Clearstar USDC Reactor
  '0x12AFDeFb2237a5963e7BAb3e2D46ad0eee70406e', // Re7 USDC
  '0x0FaBfEAcedf47e890c50C8120177fff69C6a1d9B', // Pyth USDC
  '0xef417a2512C5a41f69AE4e021648b69a7CdE5D03', // Yearn OG USDC
  '0xE74c499fA461AF1844fCa84204490877787cED56', // Yield Clearstar USDC
  '0x236919F11ff9eA9550A4287696C2FC9e18E6e890', // Gauntlet USDC Frontier
  '0x8773447e6369472D9B72f064Ea62e405216E9084', // MEV Frontier USDC Vault
  '0x75e1A1f9535C01CDcE25E51ea4aFF0d171337E1F', // Apostro USDC
  '0x43e623Ff7D14d5b105F7bE9c488F36dbF11D1F46', // Clearstar Boring USDC
  '0x1401d1271C47648AC70cBcdfA3776D4A87CE006B', // Pangolins USDC
  '0xCBeeF01994E24a60f7DCB8De98e75AD8BD4Ad60d', // Steakhouse High Yield USDC v2
  // Euler vaults
  '0x0A1a3b5f2041F33522C4efc754a7D096f880eE16', // Euler Base USDC
  '0xC063C3b3625DF5F362F60f35B0bcd98e0fa650fb', // Apostro Resolv USDC
  '0x085178078796Da17B191f9081b5E2fCCc79A7eE7', // Frontier YO USDC
  '0x611745c9107d0197f161556691c5129fD9B898D1', // Euler Edge USDC
  '0x5435BC53f2C61298167cdB11Cdf0Db2BFa259ca0', // Edge UltraYield USDC
  '0x4C1aeda9B43EfcF1da1d1755b18802aAbe90f61E', // AlphaGrowth USDC Base
  // SparkFi
  '0x3128a0F7f0ea68E7B7c9B00AFa7E41045828e858', // Spark USDC Vault
  // Revert Lend
  '0x36AEAe0E411a1E28372e0d66f02E57744EbE7599', // Revert Lend Base USDC
  // Yo
  '0x0000000f2eB9f69274678c76222B35eEc7588a65', // yoVaultUSD
  // Tokemak
  '0x9c6864105AEC23388C89600046213a44C384c831', // Tokemak baseUSD
  // 40acres
  '0xB99B6dF96d4d5448cC0a5B3e0ef7896df9507Cf5', // 40acres USDC Vault
  // Wasabi
  '0x1C4a802FD6B591BB71dAA01D8335e43719048B24', // Spicy USDC Vault
  // Avantis
  '0x944766f715b51967E56aFdE5f0Aa76cEaCc9E7f9', // Avantis USDC Vault
  // Fluid
  '0xf42f5795D9ac7e9D757dB633D693cD548Cfd9169', // Fluid USDC
].map(a => a.toLowerCase());

function normalizeToken(token) {
  if (token.toLowerCase() === ADDRESSES.GAS_TOKEN_2) return ADDRESSES.null;
  return token.toLowerCase();
}

async function tvl(api) {
  const { agentAnalytics = [] } = await getConfig('yieldseeker/yield-agents/', API_URL);

  // Step 1: build ownerTokens and fetch all balances on-chain
  const ownerTokens = [];
  for (const agent of agentAnalytics) {
    if (!agent?.snapshot?.tokenBalances || typeof agent.snapshot.tokenBalances !== 'object') continue;
    const tokens = Object.keys(agent.snapshot.tokenBalances).map(normalizeToken);
    if (tokens.length > 0) ownerTokens.push([tokens, agent.agentWalletAddress]);
  }
  await api.sumTokens({ ownerTokens, permitFailure: true });

  // Step 2: unwrap ERC4626 vault share balances to their underlying asset on-chain
  const vaultsWithBalances = ERC4626_VAULTS.filter(vault => {
    const bal = api.getBalances()[`${api.chain}:${vault}`];
    return bal && bal !== '0';
  });

  if (vaultsWithBalances.length === 0) return;

  const assets = await api.multiCall({ abi: 'address:asset', calls: vaultsWithBalances, permitFailure: true });

  // Use convertToAssets(shareBalance) per vault — this is the canonical ERC4626 conversion
  // and handles vaults like Revert Lend where totalSupply includes debt shares
  const underlyingAmounts = await api.multiCall({
    abi: 'function convertToAssets(uint256) view returns (uint256)',
    calls: vaultsWithBalances.map((vault) => ({
      target: vault,
      params: [BigInt(Math.round(Number(api.getBalances()[`${api.chain}:${vault}`]))).toString()],
    })),
    permitFailure: true,
  });

  for (let i = 0; i < vaultsWithBalances.length; i++) {
    const asset = assets[i];
    const underlyingAmount = underlyingAmounts[i];
    if (!asset || !underlyingAmount) continue;

    api.removeTokenBalance(`${api.chain}:${vaultsWithBalances[i]}`);
    api.add(asset.toLowerCase(), underlyingAmount);
  }
}

module.exports = {
  methodology: 'Counts the tokens held across all YieldSeeker agent wallets. Wallet addresses and held tokens are obtained from the YieldSeeker API; balances and ERC4626 vault unwrapping are read on-chain.',
  timetravel: false,
  doublecounted: true,
  base: { tvl },
};
