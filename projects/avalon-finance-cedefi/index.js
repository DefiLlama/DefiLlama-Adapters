const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk');
const { sumTokensExport } = require('../helper/sumTokens');

const abi = {
  "getPoolManagerReserveInformation": "function getPoolManagerReserveInformation() view returns (tuple(uint256 userAmount, uint256 collateral, uint256 debt, uint256 claimableUSDT, uint256 claimableBTC) poolManagerReserveInfor)"
}

const config = {
  ethereum: { poolAddress: "0x02feDCff97942fe28e8936Cdc3D7A480fdD248f0", lfbtcAddress: "0x3119a1AD5B63A000aB9CA3F2470611eB997B93B9", usdtAddress: ADDRESSES.ethereum.USDT, },
}

// @dev btcOwnersOfCedefi: Bitcoin owners of the Avalon CeDefi pool contract.
const btcOwnersOfCedefi = [
'32DgQPVHSV6FSxLnw68nggvchp3ZNKquxA',
'bc1qr5nz7n8ulcdz0w3s6fska80fawxhvqlh273qypm3rkjequ9wpmhs65ppw7',
'bc1qhu98nf6ddz6ja73rn72encdr8ezsyhexwpdzap0vcs7lg2wpmrnq5ygfsl',
'bc1qg6asmzjr7nr5f5upg3xqyrdxl2tq8ef58hha7t0s82mzzx6zjxesyccp4h',
'bc1qxe3md4lehg8gmrlx3e8xqju5mytt266l4hcy8khl6tm5mahghmeqtxlgqq',
'bc1qy48h0kuv0r3e330wjfs6r74sk49pkzumnm907t5mhqjxml22r3ss2ucuxc',
]

// @dev getMetrics: call to get the collateral and debt of the Avalon CeDefi pool contract.
const getMetrics = async (api, borrowed) => {
  const { poolAddress, lfbtcAddress, usdtAddress } = config[api.chain]
  const marketData = await api.call({ abi: abi.getPoolManagerReserveInformation, target: poolAddress, });
  // @note: no more count collateral on Ethereum, count collateral on Bitcoin instead
  // const balanceOfCollateral = marketData.collateral;
  const balanceOfDebt = marketData.debt;

  if (borrowed)
    api.add(usdtAddress, balanceOfDebt);
  // else
  //   api.add(lfbtcAddress, balanceOfCollateral);
}

module.exports = {
  methodology: `lfbtc collateral, USDT debt of Avalon CeDefi pool contract and Bitcoin owners of the Avalon CeDefi pool contract`,
  doublecounted: false,
  ethereum: {
    tvl: (api) => getMetrics(api, false),
    borrowed: (api) => getMetrics(api, true),
  },
  bitcoin: {
    tvl: sdk.util.sumChainTvls([
      sumTokensExport({ owners: btcOwnersOfCedefi }),
    ]),
  },
}
