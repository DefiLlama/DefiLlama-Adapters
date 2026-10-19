const ADDRESSES = require('../helper/coreAssets.json')
const abi = {
    "getAllAssets": "address[]:getAllAssets",
    "checkBalance": "function checkBalance(address _asset) view returns (uint256 balance)",
    "supportsAsset": "function supportsAsset(address _asset) view returns (bool)"
  };
const { staking } = require("../helper/staking");

const vault = "0xE75D77B1865Ae93c7eaa3040B038D7aA7BC02F70";
const OUSD = "0x2A8e1E676Ec238d8A992307B495b45B3fEAa5e86";
const ZERO_ADDRESS = ADDRESSES.null;

// Curve AMO strategies mint OUSD to pair against the vault's stablecoin inside the pool, and their
// checkBalance() reports the strategy's whole LP position -- both sides. That leaves the vault
// total counting protocol-minted OUSD as if it were external backing, which is circular: redeeming
// the LP returns the stablecoin and burns the OUSD. Subtract each AMO's share of the pool's OUSD.
// (originether does the equivalent by only counting the ETH side of its Curve/Convex positions.)
//
// The AMO currently holds ~95.6% of the OUSD/USDC pool, so ~$634k of the reported ~$5.78M was its
// own minted OUSD.
const removeAmoMintedOusd = async (api) => {
  const strategies = await api.call({ abi: 'address[]:getAllStrategies', target: vault })
  // Only AMO strategies answer lpToken(); a null marks a strategy that holds no Curve position.
  const lpTokens = await api.multiCall({ abi: 'address:lpToken', calls: strategies, permitFailure: true })

  for (const [i, lpToken] of lpTokens.entries()) {
    if (!lpToken) continue

    // Read without permitFailure, and only for strategies already identified as AMOs: an AMO whose
    // gauge could not be read would otherwise fall back to zero staked LP and silently skip its
    // deduction, which is the whole point of this function. A gauge-less AMO returns the zero
    // address, which is a real answer and handled below.
    const gauge = await api.call({ abi: 'address:gauge', target: strategies[i] })

    // The strategy's pool share, read straight off its LP position: held directly plus staked in
    // the gauge. Taken from the LP rather than checkBalance() so a strategy that does not support
    // one of the vault's assets cannot silently contribute a partial value here.
    const [held, staked, lpSupply, poolOusd] = await Promise.all([
      api.call({ abi: 'erc20:balanceOf', target: lpToken, params: strategies[i] }),
      gauge.toLowerCase() === ZERO_ADDRESS
        ? 0
        : api.call({ abi: 'erc20:balanceOf', target: gauge, params: strategies[i] }),
      api.call({ abi: 'erc20:totalSupply', target: lpToken }),
      api.call({ abi: 'erc20:balanceOf', target: OUSD, params: lpToken }),
    ])

    if (!Number(lpSupply)) continue

    // The pool's OUSD is protocol-minted in proportion to the share the AMO owns.
    const share = (Number(held) + Number(staked)) / Number(lpSupply)
    api.add(OUSD, -share * Number(poolOusd))
  }
}

const ethTvl = async (api) => {
  const tokens = await api.call({  abi: abi.getAllAssets, target: vault})
  const bals = await api.multiCall({  abi: abi.checkBalance, calls: tokens, target: vault})
  api.add(tokens, bals)

  await removeAmoMintedOusd(api)
};

module.exports = {
  ethereum: {
    tvl: ethTvl,
    staking: staking(
      "0x63898b3b6Ef3d39332082178656E9862bee45C57", "0x8207c1FfC5B6804F6024322CcF34F29c3541Ae26",
    ),
  },
};
