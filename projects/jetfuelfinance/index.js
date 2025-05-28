const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { compoundExports } = require("../helper/compound");

// Jetswap section
//const factory = "0x0eb58E5c8aA63314ff5547289185cC4583DfCBD5";

/*Vaults found via Jetfuel 1 deployer, some it could not be tracked
* so there is missing a small % of tvl compare to their official site stated amount ~60m
*/
const vaults = [
  "0x4149531aeD145a15ccc361C469B0c79FE26B4F1c",
  "0x1Ae8F478571E7BC7caC067a8FCD298749BE722AE",
  "0x06FD5CaB123990a0dd0Ba2130Bfa76Da26C91b43",
  "0x7F2E9e374E97f171c9eD3E0910111b15B9045644",
  "0xF2F11389cE9cf23c37B03131Df914772BA17e664",
  "0x755aAC39603599D2a10C407C3D06deE96999Ae90",
  "0xD0B1DC1B39A730D634902c01C61316A97afA31B5",
  "0x465A5e8501Bf38898A8AeAd87f0d864AdCc826a4",
  "0xED2097330741aC6AA574C0EDa26A7ad41c976fb0",
  "0xA10983a758DbD8998215dB48b44A0aDa77C5f7DB",
  "0xd1C249dc749E6458813Da36a3dE0Bb4A75cd3104",
  "0x229e084E2C88a09aA04eEdbF93c3D728D06DAE58",
  "0x229eeDacA481A673cd7F318Dffd35489Fdb3c888",
  "0x99cC3060487fA635Cfd9BCFf69417D225b3f0104",
  "0x29C12B9cE7df205C944725520718D10aafA78433",
  "0x804ef864d199E28C1F48d179FAeb53683B671875",
  "0x980edEc0A2a62E3D396A1a60EE8101f5116De316",
  "0x4e52Ae85329474EC9e2469bdD1d0491EA2C41254",
  "0x032bb900363BE7A2fA566694A7F065F13820EcDA",
  "0x6bA6c5aa9b3B24Bb786E31adb4AE36397678a64b",
  "0xA6d55074b038a082748c88D9C3E56821C44474ff",
];

const single_side_vault = [
  //wbnb vault
  "0x15e84D6eD8997590E02b25d3D3CeEe9686753306",
  // eth vault
  "0x647db6Dce3C36Ac1a3BA48f0F6B767A6c73E22D2",
  // btcb vault
  "0xeaa8234D9bf8Dfc6C8c24D3d24BE3cAd256450EF",
];

const single_side_assets = [
  ADDRESSES.bsc.WBNB,
  ADDRESSES.bsc.BETH,
  ADDRESSES.bsc.BTCB,
];

//const factoryTvl = uniTvlExport(factory, 'bsc')

const bscTvl = async (timestamp, block, chainBlocks) => {
  // Jetswap section
  const balances =  {}

  // Vault section in their repo
  const vault_balances = (
    await sdk.api.abi.multiCall({
      abi: abi.balance,
      calls: vaults.map((address) => ({ target: address })),
      chain: "bsc",
      block: chainBlocks["bsc"],
    })
  ).output.map((el) => el.output);

  const vault_tokens = (
    await sdk.api.abi.multiCall({
      abi: abi.token,
      calls: vaults.map((address) => ({ target: address })),
      chain: "bsc",
      block: chainBlocks["bsc"],
    })
  ).output.map((el) => el.output);

  const lpPositions = [];

  vault_balances.forEach((vault, idx) => {
    lpPositions.push({
      token: vault_tokens[idx],
      balance: vault,
    });
  });

  const transformAddress = i => `bsc:${i}`;

  await unwrapUniswapLPs(
    balances,
    lpPositions,
    chainBlocks["bsc"],
    "bsc",
    transformAddress
  );

  const vault_single_side_balances = (
    await sdk.api.abi.multiCall({
      abi: abi.balance,
      calls: single_side_vault.map((address) => ({ target: address })),
      chain: "bsc",
      block: chainBlocks["bsc"],
    })
  ).output.map((el) => el.output);

  vault_single_side_balances.forEach((bal, idx) => {
    sdk.util.sumSingleBalance(balances, `bsc:${single_side_assets[idx]}`, bal);
  });

  return balances;
};

const {tvl:lendingTvl, borrowed} = compoundExports("0x67340bd16ee5649a37015138b3393eb5ad17c195", "0xE24146585E882B6b59ca9bFaaaFfED201E4E5491", ADDRESSES.bsc.WBNB)

module.exports = {
  bsc: {
    tvl: sdk.util.sumChainTvls([ bscTvl, lendingTvl]),
    borrowed
  },
};
