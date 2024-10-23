const sui = require("../helper/chain/sui");
const ADDRESSES = require('../helper/coreAssets.json')

const suiScallopPools = {
  usdc: {
    poolId: "0x4ace6648ddc64e646ba47a957c562c32c9599b3bba8f5ac1aadb2ae23a2f8ca0",
    rewardPoolId: "0xf4268cc9b9413b9bfe09e8966b8de650494c9e5784bf0930759cfef4904daff8",
    type: ADDRESSES.sui.USDC,
    stakeType: "0xefe8b36d5b2e43728cc323298626b83177803521d195cfb11e15b910e892fddf::reserve::MarketCoin<0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN>",
    balanceSheet: '0x2f4df5e1368fbbdaa5c712d28b837b3d41c2d3872979ccededcdfdac55ff8a93',
    spoolAccount: 'a5a2d2afe12ed353ca32a3d5f7592a7a57945040ee7beacab6d82a5fe5b34734',
    decimals: 6,
  },
  usdt: {
    poolId: "0xcb328f7ffa7f9342ed85af3fdb2f22919e1a06dfb2f713c04c73543870d7548f",
    rewardPoolId: "0x2c9f934d67a5baa586ceec2cc24163a2f049a6af3d5ba36b84d8ac40f25c4080",
    type: ADDRESSES.sui.USDT,
    stakeType: "0xefe8b36d5b2e43728cc323298626b83177803521d195cfb11e15b910e892fddf::reserve::MarketCoin<0xc060006111016b8a020ad5b33834984a437aaa7d3c74c18e09a95d48aceab08c::coin::COIN>",
    balanceSheet: '0xfbc056f126dd35adc1f8fe985e2cedc8010e687e8e851e1c5b99fdf63cd1c879',
    spoolAccount: '775206c05243da6b1a29a45c74bd3d3e7db4b3f8303342cbf34c3d12725eac70',
    decimals: 6,
  },
  weth: {
    poolId: "0xeec40beccb07c575bebd842eeaabb835f77cd3dab73add433477e57f583a6787",
    rewardPoolId: "0x957de68a18d87817de8309b30c1ec269a4d87ae513abbeed86b5619cb9ce1077",
    type: ADDRESSES.sui.WETH,
    stakeType: "0xefe8b36d5b2e43728cc323298626b83177803521d195cfb11e15b910e892fddf::reserve::MarketCoin<0xaf8cd5edc19c4512f4259f0bee101a40d41ebed738ade5874359610ef8eeced5::coin::COIN>",
    balanceSheet: '0xc8fcdff48efc265740ae0b74aae3faccae9ec00034039a113f3339798035108c',
    spoolAccount: '3865596e3ea8860e4d479b91d2b9f5c57adab00d70b13ac6c7eb410fd092d2cc',
    decimals: 8,
  },
}
const suiNaviPools = {
  naviAddress: "0x966231078dda644567e71131267946b0e4cef7740d298f94b30af3293be1a755",
  reserveParentId: "0xe6d4c6610b86ce7735ea754596d71d72d10c7980b5052fc3c8cdf8d09fea9b4b",
  usdc: {
    supplyBalanceParentId: "0x8d0a4467806458052d577c8cd2be6031e972f2b8f5f77fce98aa12cd85330da9",
    assetId: 1,
    decimals: 6,
  },
  usdt: {
    supplyBalanceParentId: "0x7e2a49ff9d2edd875f82b76a9b21e2a5a098e7130abfd510a203b6ea08ab9257",
    assetId: 2,
    decimals: 6,
  },
  weth: {
    supplyBalanceParentId: "0xa668905b1ad445a3159b4d29b1181c4a62d864861b463dd9106cc0d97ffe8f7f",
    assetId: 3,
    decimals: 6,
  },
}

async function tvl(api) {
  const [ethInNaviSui, ethInScallopSui, usdtInNaviSui, usdtInScallopSui, usdcInNaviSui, usdcInScallopSui] = await Promise.all([
    naviSui("weth"),
    scallopSui("weth"),
    naviSui("usdt"),
    scallopSui("usdt"),
    naviSui("usdc"),
    scallopSui("usdc"),
  ]);
  api.addGasToken(ethInNaviSui * 1e18)
  api.addGasToken(ethInScallopSui * 1e18)
  api.add(ADDRESSES.ethereum.USDT, usdtInNaviSui * 1e6)
  api.add(ADDRESSES.ethereum.USDT, usdtInScallopSui * 1e6)
  api.add(ADDRESSES.ethereum.USDC, usdcInNaviSui * 1e6)
  api.add(ADDRESSES.ethereum.USDC, usdcInScallopSui * 1e6)
}


async function scallopSui(coinSymbol) {
  const spoolAccountResp = await sui.getObject(suiScallopPools[coinSymbol].spoolAccount);
  const stakesBalance = spoolAccountResp?.fields?.stakes ?? 0
  const stakeBalance = stakesBalance / 10 ** suiScallopPools[coinSymbol].decimals
  const balanceSheetResp = await sui.getObject(suiScallopPools[coinSymbol].balanceSheet);
  const cash = balanceSheetResp?.fields?.value?.fields?.cash ?? 0
  const debt = balanceSheetResp?.fields?.value?.fields?.debt ?? 0
  const revenue = balanceSheetResp?.fields?.value?.fields?.revenue ?? 0
  const marketCoinSupply = balanceSheetResp?.fields?.value?.fields?.market_coin_supply ?? 0
  const conversionRate = (+cash + +debt - +revenue) / marketCoinSupply
  const tvl = stakeBalance * conversionRate
  return tvl;
}

async function naviSui(coinSymbol) {
  const naviResp = await sui.getDynamicFieldObject(
    suiNaviPools[coinSymbol].supplyBalanceParentId,
    suiNaviPools.naviAddress,
    { idType: 'address' });

  const currentSupply = naviResp?.fields?.value ?? 0

  const assetResp = await sui.getDynamicFieldObject(
    suiNaviPools.reserveParentId,
    suiNaviPools[coinSymbol].assetId,
    { idType: 'u8' }
  );
  const currentSupplyIndexOrg = assetResp?.fields?.value?.fields?.current_supply_index;
  const currentSupplyIndex = currentSupplyIndexOrg / 1e27

  const decimals = suiNaviPools[coinSymbol].decimals
  const tvl = (currentSupply / 1e9) * currentSupplyIndex
  return tvl;
}

module.exports = {
  start: 1716599207,
  timetravel: false,
  ethereum: {
    tvl
  }
};