const sdk = require("@defillama/sdk");
const BigNumber = require("bignumber.js");

// ABIS
const NAKED_ABI = require("./config/mantra-dao/NAKED_STAKING.json");
const LP_ABI = require("./config/mantra-dao/LP_STAKING.json");
const UNI_ABI = require("./config/mantra-dao/UNI_LP.json");
const { extendSchemaImpl } = require("graphql/utilities/extendSchema");

// ETH Staking and pool assets
const stakingAssetsETH = [
  // sOM POOL 1 - Staked OM
  {
    contract: "0x9E15Ad979919bB4db331Bfe864475Ae3BFFebA93",
    token: "0x3593D125a4f7849a1B059E64F4517A86Dd60c95d",
    price: "mantra-dao",
  },
  // sOM POOL 2 - Staked OM
  {
    contract: "0xa01892d97e9c8290c2c225fb0b756bfe26bc9802",
    token: "0x3593D125a4f7849a1B059E64F4517A86Dd60c95d",
    price: "mantra-dao",
  },
  // RFUEL Pool 1 - Staked RFUEL
  // {
  //   contract: "0xE8F063c4dC60B2F6c2C900d870ddcDae7DaAb7F6",
  //   token: "0xaf9f549774ecedbd0966c52f250acc548d3f36e5",
  //   price: "rio-defi",
  // },
  // RFUEL Pool 2 - Staked RFUEL
  {
    contract: "0x456DF576962289256A92290C9E48EE116B8Cb413",
    token: "0xaf9f549774ecedbd0966c52f250acc548d3f36e5",
    price: "rio-defi",
  },
  // L3P - Staked Lepricon
  {
    contract: "0xdbc34d084393ed8d7b750FfCCea5A139EC7b9349",
    token: "0xdef1da03061ddd2a5ef6c59220c135dec623116d",
    price: "lepricon",
  },
  // ROYA - Staked royale
  {
    contract: "0x4Cd4c0eEDb2bC21f4e280d0Fe4C45B17430F94A9",
    token: "0x7eaF9C89037e4814DC0d9952Ac7F888C784548DB",
    price: "royale",
  },
  // Finxflo - Staked Finxflo
  {
    contract: "0x6BcDC61A7A6d86f7b7B66d461b7eF7fa268571a0",
    token: "0x8a40c222996f9F3431f63Bf80244C36822060f12",
    price: "finxflo",
  },
  // PKF - Staked Polkafoundry
  {
    contract: "0x1dfdb0fb85402dc7f8d72d92ada8fbbb3ffc8633",
    token: "0x4eed0fa8de12d5a86517f214c2f11586ba2ed88d",
    price: "polkafoundry",
  },
  // RAZE - Staked Raze
  {
    contract: "0x2d0ea72db9f9a63f4b185eab1ca74137d808ebfa",
    token: "0x5eaa69b29f99c84fe5de8200340b4e9b4ab38eac",
    price: "raze-network",
  },
  // KYL - Staked KYL
  {
    contract: "0x6ae05b5db520011bf76645ebb4d6a697e5b3774b",
    token: "0x67b6d479c7bb412c54e03dca8e1bc6740ce6b99c",
    price: "kylin-network",
  },
  // LABS Pool 1 - Staked LABS
  {
    contract: "0x6f0db359309CAD297D2e7952a4F5f081bDC1e373",
    token: "0x8b0e42f366ba502d787bb134478adfae966c8798",
    price: "labs-group",
  },
  // LABS Pool 2 - Staked LABS
  {
    contract: "0xb96e42c0de658ca26048b0e200f9a1e05ad89e0f",
    token: "0x8b0E42F366bA502d787BB134478aDfAE966C8798",
    price: "labs-group",
  },
  // OM Mantra pool - Staked OM in mantra pool
  // {
  //   contract: "0x1a22188b5F6faf7253a3DefCC576884c0FF50a91",
  //   token: "0x3593D125a4f7849a1B059E64F4517A86Dd60c95d",
  //   price: "mantra-dao",
  // },
  // Bondly staking
  {
    contract: "0x39621A555554A7FF77F2b64185c53E04C90cD540",
    token: "0xd2dda223b2617cb616c1580db421e4cfae6a8a85",
    price: "bondly",
  },
  // BITE staking
  {
    contract: "0xa571309B1267676568Bf9f155606a08790896Fe2",
    token: "0x4eED0fa8dE12D5a86517f214C2f11586Ba2ED88D",
    price: "dragonbite",
  },
  // BCUBE staking
  {
    contract: "0xb19b94d53D362CDfC7360C951a85ca2c1d5400BA",
    token: "0x93C9175E26F57d2888c7Df8B470C9eeA5C0b0A93",
    price: "b-cube-ai",
  },
  // IMPACT staking
  {
    contract: "0x6DdF7743f56Efa60a4834AFEd16B2dc13308f13e",
    token: "0xFAc3f6391C86004289A186Ae0198180fCB4D49Ab",
    price: "alpha-impact",
  },
];

// ETH LP Staking
const lpStakingAssetsETH = [
  // LABS-ETH UNI LP simple staking
  {
    contract: "0x5f81a986611C600a3656d9adc202283186C6121D",
    pairAddress: "0x2d9fd51e896ff0352cb6d697d13d04c2cb85ca83",
    token1: "0x2D9FD51E896Ff0352Cb6D697D13D04C2CB85CA83",
    price1: "labs-group",
    token2: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    price2: "weth",
  },
  // LABS-ETH UNI LP staking with exit tollbooth
  {
    contract: "0xfc8e3b55897d8cef791451bbe69b204b9c58fc8a",
    pairAddress: "0x2d9fd51e896ff0352cb6d697d13d04c2cb85ca83",
    token1: "0x2D9FD51E896Ff0352Cb6D697D13D04C2CB85CA83",
    price1: "labs-group",
    token2: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    price2: "weth",
  },
  // MANTRA DAO OM-ETH LP staking
  {
    contract: "0x91fe14df53eae3a87e310ec6edcdd2d775e1a23f",
    pairAddress: "0xe46935ae80e05cdebd4a4008b6ccaa36d2845370",
    token1: "0x3593D125a4f7849a1B059E64F4517A86Dd60c95d",
    price1: "mantra-dao",
    token2: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    price2: "weth",
  },
  // ROYA-ETH LP staking
  {
    contract: "0x55e0F2cE66Fa8C86ef478fa47bA0bE978eFC2647",
    pairAddress: "0x6d9d2427cfa49e39b4667c4c3f627e56ae586f37",
    token1: "0x4Cd4c0eEDb2bC21f4e280d0Fe4C45B17430F94A9",
    price1: "royale",
    token2: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    price2: "weth",
  },
  // OM V1-ETH LP Staking
  {
    contract: "0x659236870915601d8B581e4355BD822483Fe5739",
    pairAddress: "0x99b1db3318aa3040f336fb65c55400e164ddcd7f",
    token1: "0x2baecdf43734f22fd5c152db08e3c27233f0c7d2",
    price1: "mantra-dao",
    token2: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    price2: "weth",
  },
  // BONDLY-ETH LP staking
  {
    contract: "0x4D081F600b480b0Ce8b422FBa3a5ea1Fb4b36b3B",
    pairAddress: "0x9dc696f1067a6b9929986283f6d316be9c9198fd",
    token1: "0xd2dda223b2617cb616c1580db421e4cfae6a8a85",
    price1: "bondly",
    token2: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    price2: "weth",
  },
  // BONDLY-USDT LP staking
  {
    contract: "0x3dd713aafb46cb359c8711f4783836ba2e3e426c",
    pairAddress: "0xdc43e671428b4e7b7848ea92cd8691ac1b80903c",
    token1: "0xd2dda223b2617cb616c1580db421e4cfae6a8a85",
    price1: "bondly",
    token2: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    price2: "usdt",
  },
  // BITE-ETH LP staking
  {
    contract: "0xb12f0CbcC89457d44323139e6Bb0526Fd82f12F2",
    pairAddress: "0x1f07f8e712659087914b96db4d6f6e4fee32285e",
    token1: "0x4eed0fa8de12d5a86517f214c2f11586ba2ed88d",
    price1: "dragonbite",
    token2: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    price2: "weth",
  },
  // BITE-ETH LP staking w/ tollbooth
  {
    contract: "0x18Ba986ED3128fc7E3E86a09E902436e900a899c",
    pairAddress: "0x1f07f8e712659087914b96db4d6f6e4fee32285e",
    token1: "0x4eed0fa8de12d5a86517f214c2f11586ba2ed88d",
    price1: "dragonbite",
    token2: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    price2: "weth",
  },
  // BBANK-ETH LP staking
  {
    contract: "0x6406788d1CD4fdD823ef607A924c00a4244a841d",
    pairAddress: "0x2a182e532a379cb2c7f1b34ce3f76f3f7d3596f7",
    token1: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    price1: "weth",
    token2: "0xf4b5470523ccd314c6b9da041076e7d79e0df267",
    price2: "blockbank",
  },
  // RAZE-ETH LP staking
  {
    contract: "0xe2a80A76B084B51CFAe5B2C3e0FF5232e0408201",
    pairAddress: "0x4fc47579ecf6aa76677ee142b6b75faf9eeafba8",
    token1: "0x5eaa69b29f99c84fe5de8200340b4e9b4ab38eac",
    price1: "raze-network",
    token2: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    price2: "weth",
  },
  // IMPACT-ETH LP staking
  {
    contract: "0x7c82127b14C69C05fa482B7B079A59F2d114d333",
    pairAddress: "0xa3053da613e5312c9e4b50edfb85f5a512c556d7",
    token1: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    price1: "weth",
    token2: "0xfac3f6391c86004289a186ae0198180fcb4d49ab",
    price2: "alpha-impact",
  },
  // BCUBE-ETH LP staking
  {
    contract: "0xFF964d0bf9f81c401932A6B975EAE54129712eE5",
    pairAddress: "0xc62bf2c79f34ff24e2f97982af4f064161ed8949",
    token1: "0x93c9175e26f57d2888c7df8b470c9eea5c0b0a93",
    price1: "b-cube-ai",
    token2: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    price2: "weth",
  },
];

async function getNakedStakingTotalStaked(chain, asset, block) {
  let { output: assetTotalStaked } = await sdk.api.abi.call({
    block,
    target: asset.contract,
    abi: NAKED_ABI.totalStaked,
    chain: chain,
  });

  let { output: decimals } = await sdk.api.abi.call({
    abi: "erc20:decimals",
    target: asset.contract,
    chain: chain,
  });

  return BigNumber(assetTotalStaked)
    .div(10 ** decimals)
    .toFixed(0);
}

async function getLPStakingPoolTVL(chain, asset, block) {
  let balances = {};
  // get pairAddress decimals

  let { output: pairDecimals } = await sdk.api.abi.call({
    abi: "erc20:decimals",
    target: asset.pairAddress,
    chain: chain,
  });

  // get pairAddress totalSupply scaled down

  let { output: pairtTotalSupply } = await sdk.api.abi.call({
    block,
    target: asset.pairAddress,
    abi: UNI_ABI.totalSupply,
    chain: chain,
  });

  let pairtTotalSupplyScaled = BigNumber(pairtTotalSupply).div(
    10 ** pairDecimals
  );

  // get pairAddress token1supply scaled down

  let { output: token1supply } = await sdk.api.abi.call({
    block,
    target: asset.pairAddress,
    abi: UNI_ABI.getReserves,
    chain: chain,
  });

  let token1SupplyScaled = BigNumber(token1supply).div(10 ** pairDecimals);

  // get pairAddress token1 price

  let { output: tokenA } = await sdk.api.abi.call({
    block,
    target: asset.pairAddress,
    abi: UNI_ABI.token0,
    chain: chain,
  });
  sdk.util.sumSingleBalance(balances, tokenA, 0);
  console.log(balances);

  // calculate lp token price

  let lpTokenPrice =
    ((token1SupplyScaled * token1price) / pairtTotalSupplyScaled) * 2;

  // get decimals of mdao lp staking contract

  let { output: decimals } = await sdk.api.abi.call({
    block,
    target: asset.contract,
    abi: "erc20:decimals",
    chain: chain,
  });

  // get totalSupply of lp staking contract

  let { output: totalSupply } = await sdk.api.abi.call({
    block,
    target: asset.contract,
    abi: LP_ABI.totalSupply,
    chain: chain,
  });

  // let totalSupplyScaled = BigNumber(totalSupply).div(10 ** decimals);

  let lpTVL = parseFloat(totalSupplyScaled) * lpTokenPrice;
  // console.log(BigNumber(lpTVL).toFixed(0));
  return BigNumber(lpTVL).toFixed(0);
}

async function ethereum(timestamp, ethBlock, chainBlocks) {
  let balances = {};
  let balancesLP = {};

  await Promise.all(
    stakingAssetsETH.map(async (asset) => {
      let poolTVL = await getNakedStakingTotalStaked(
        "ethereum",
        asset,
        chainBlocks["ethereum"]
      );
      sdk.util.sumSingleBalance(balances, asset.price, poolTVL);
    })
  );

  await Promise.all(
    lpStakingAssetsETH.map(async (asset) => {
      let lpPoolTVL = await getLPStakingPoolTVL(
        "ethereum",
        asset,
        chainBlocks["ethereum"]
      );
      // console.log(asset.pairAddress, lpPoolTVL);
      // sdk.util.sumSingleBalance(balances, asset.contract, lpPoolTVL);
    })
  );

  return balances;
}

module.exports = {
  ethereum: {
    tvl: ethereum,
  },
};
