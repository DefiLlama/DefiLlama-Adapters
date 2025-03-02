const SHADOW_NFT_MANAGER = require("./shadow-nft-manager-abi.json");
const SHADOW_FACTORY = require("./shadow-factory-abi.json");
const SHADOW_LIQUIDITY_POOL = require("./shadow-liquidity-abi.json");

const EQUALIZER_NFT_MANAGER = require("./equalizer-nft-manager-abi.json");
const EQUALIZER_POOL = require("./equalizer-pool-abi.json");
const { sumTokens2, sumTokensExport } = require('../helper/unwrapLPs');

// sonic
const tokens = [
  "0x0000000000000000000000000000000000000000", // ETH
];

const owner = '0xe220E8d200d3e433b8CFa06397275C03994A5123';
const SHADOW_DEX_NFT_MANAGER = '0x12E66C8F215DdD5d48d150c8f46aD0c6fB0F4406';
const SHADOW_DEX_FACTORY = '0xcD2d0637c94fe77C2896BbCBB174cefFb08DE6d7';
const EQUALIZER_DEX_NFT_MANAGER = '0xC6b515328F970EC25228A716BF91774E5BD5Abc0';
const WS_TOKEN_CONTRACT = '0x039e2fB66102314Ce7b64Ce5Ce3E5183bc94aD38';

async function tvl(api) {
  // native crypto currency from the launchpad
  const nativeBalance = await sumTokens2({ owner, tokens, api});
  console.log("NativeBalance(S): " + nativeBalance['sonic:0x0000000000000000000000000000000000000000']);

  // Get the liquidity amount from the Shadow DEX
  const nftBalance = await api.call({ abi: SHADOW_NFT_MANAGER.balanceOf, target: SHADOW_DEX_NFT_MANAGER, params: [owner] });

  let allShadowPrice = 0;
  for(let i = 0;i < nftBalance;i ++) {
    const TOKEN_BY_INDEX = await api.call({
      abi: SHADOW_NFT_MANAGER.tokenOfOwnerByIndex,
      target: SHADOW_DEX_NFT_MANAGER,
      params: [owner, i],
    });

    const POSITION_LIQUIDITY = await api.call({
      abi: SHADOW_NFT_MANAGER.positions,
      target: SHADOW_DEX_NFT_MANAGER,
      params: [parseInt(TOKEN_BY_INDEX)],
    });

    const LIQUIDITY_POOL = await api.call({
      abi: SHADOW_FACTORY.getPool,
      target: SHADOW_DEX_FACTORY,
      params: [POSITION_LIQUIDITY.token0, POSITION_LIQUIDITY.token1, POSITION_LIQUIDITY.tickSpacing],
    });

    const LIQUIDITY_POOL_TOTAL_SUPPLY = await api.call({
      abi: SHADOW_LIQUIDITY_POOL.liquidity,
      target: LIQUIDITY_POOL,
      params: [],
    });

    const wsTokenBalance = await api.call({
      abi: 'erc20:balanceOf',
      target: WS_TOKEN_CONTRACT,
      params: [LIQUIDITY_POOL],
    });
  
    const tokenBalance = wsTokenBalance * LIQUIDITY_POOL_TOTAL_SUPPLY / POSITION_LIQUIDITY.liquidity;
    allShadowPrice += tokenBalance;
  }
  console.log("\nShadowBalance(ws): " + allShadowPrice);

  // Get the liquidity amount from the Equalizer DEX
  let allEqualizerBalance = 0;
  const eLockList = await api.call({ abi: EQUALIZER_NFT_MANAGER.tokensOfOwner, target: EQUALIZER_DEX_NFT_MANAGER, params: [owner] });

  for(let i = 0;i < eLockList.length;i ++) {
    const lockedAssetsInfo = await api.call({ abi: EQUALIZER_NFT_MANAGER.lockedAssets, target: EQUALIZER_DEX_NFT_MANAGER, params: [eLockList[i]] });
    const lockedPoolContractAddress = lockedAssetsInfo[0];
    const liquidityAmount = lockedAssetsInfo[1];
    
    const LIQUIDITY_POOL_TOTAL_SUPPLY = await api.call({
      abi: EQUALIZER_POOL.totalSupply,
      target: lockedPoolContractAddress,
      params: [],
    });

    const wsTokenBalance = await api.call({
      abi: 'erc20:balanceOf',
      target: WS_TOKEN_CONTRACT,
      params: [lockedPoolContractAddress],
    });

    const tokenBalance = wsTokenBalance * LIQUIDITY_POOL_TOTAL_SUPPLY / liquidityAmount;
    allEqualizerBalance += tokenBalance;
  }
  
  console.log("\nEqualizerBalance(ws): " + allEqualizerBalance);
  // console.log("\nTotalBalance: " + nativeBalance + (allShadowPrice + allEqualizerBalance) * 0.73);

  nativeBalance[`sonic:${WS_TOKEN_CONTRACT}`] = allShadowPrice + allEqualizerBalance;
  return nativeBalance;// + (allShadowPrice + allEqualizerBalance) * 0.73;
}

module.exports = {
  methodology: 'counts the number of MINT tokens in the Club Bonding contract.',
  sonic: {
    tvl,
  }
}; 