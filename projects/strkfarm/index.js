/**
 * STRKFarm is a yield aggregator and strategy builder on Starknet
 * - We use various DeFi protocols on starknet to design yield strategies
 */

const { multiCall } = require("../helper/chain/starknet");
const ADDRESSES = require('../helper/coreAssets.json');
const { ERC4626AbiMap } = require('./erc4626');
const { ERC721StratAbiMap } = require('./sensei');

const STRATEGIES = {
  "AutoCompounding": [{ // auto-compounds user tokens (e.g. STRK) by investing in zkLend
    address: "0x00541681b9ad63dff1b35f79c78d8477f64857de29a27902f7298f7b620838ea", // STRK Auto-compounding
    token: ADDRESSES.starknet.STRK
  }, {
    address: "0x016912b22d5696e95ffde888ede4bd69fbbc60c5f873082857a47c543172694f", // USDC Auto-compounding
    token: ADDRESSES.starknet.USDC
  }],
  "Sensei": [{ // strategy using delta neutral looping across zklend and nostra protocols
    address: "0x020d5fc4c9df4f943ebb36078e703369c04176ed00accf290e8295b659d2cea6", // STRK Sensei
    token: ADDRESSES.starknet.STRK,
    zToken: '0x06d8fa671ef84f791b7f601fa79fea8f6ceb70b5fa84189e3159d532162efc21'
  }, {
    address: "0x04937b58e05a3a2477402d1f74e66686f58a61a5070fcc6f694fb9a0b3bae422",
    token: ADDRESSES.starknet.USDC, // USDC Sensei
    zToken: '0x047ad51726d891f972e74e4ad858a261b43869f7126ce7436ee0b2529a98f486'
  }, {
    address: "0x9d23d9b1fa0db8c9d75a1df924c3820e594fc4ab1475695889286f3f6df250",
    token: ADDRESSES.starknet.ETH, // ETH Sensei
    zToken: '0x1b5bd713e72fdc5d63ffd83762f81297f6175a5e0a4771cdadbc1dd5fe72cb1'
  }, {
    address: "0x9140757f8fb5748379be582be39d6daf704cc3a0408882c0d57981a885eed9",
    token: ADDRESSES.starknet.ETH, // ETH Sensei XL
    zToken: '0x057146f6409deb4c9fa12866915dd952aa07c1eb2752e451d7f3b042086bdeb8'
  }]
}

// returns tvl and token of the AutoCompounding strategies
async function computeAutoCompoundingTVL(api) {
  const contracts = STRATEGIES.AutoCompounding;
  // though these will be zToken (i.e. zkLend token, e.g. zUSDC), 
  // according to zkLend, 1zToken = 1 underlying token
  // so, 1 zSTRK == 1 STRK, 1 zUSDC == 1 USDC
  const totalAssets = await multiCall({
    calls: contracts.map(c => c.address),
    abi: ERC4626AbiMap.total_assets
  });

  api.addTokens(contracts.map(c => c.token), totalAssets);
}

// returns tvl and token of the Sensei strategies
async function computeSenseiTVL(api) {
  // Sensei strategies contain multiple LP tokens in each contract bcz of looping and borrow,
  // but we only consider the zToken bal divided by a factor (to offset looping) as TVL
  // - This is bcz any deposit by user first gets deposited into zkLend for zToken
  const contracts = STRATEGIES.Sensei;
  const settings = await multiCall({
    calls: contracts.map(c => c.address),
    abi: ERC721StratAbiMap.get_settings
  });

  const DENOMINATOR_FACTOR = 1000000n;
  const offsetFactors = settings.map(s => s.coefs_sum2); // The factor is in 10**6 terms
  const balances = await multiCall({
    calls: contracts.map(c => ({
      target: c.zToken,
      params: c.address,
    })),
    abi: ERC4626AbiMap.balanceOf
  });

  const adjustedBalances = balances.map((b, i) => (b * DENOMINATOR_FACTOR) / (DENOMINATOR_FACTOR + BigInt(offsetFactors[i])));
  api.addTokens(contracts.map(c => c.token), adjustedBalances);
}

async function tvl(api) {
  await computeAutoCompoundingTVL(api);
  await computeSenseiTVL(api);
}

module.exports = {
  doublecounted: true,
  methodology: "The TVL is calculated as a sum of total assets deposited into strategies",
  starknet: {
    tvl,
  },
};