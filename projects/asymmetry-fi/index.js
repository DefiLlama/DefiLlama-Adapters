const sdk = require('@defillama/sdk');
const { sumTokens } = require('../helper/unwrapLPs');
const ADDRESSES = require('../helper/coreAssets.json');

// safETH
const WSTETH = ADDRESSES.ethereum.WSTETH;
const RETH = ADDRESSES.ethereum.RETH;
const SFRXETH = ADDRESSES.ethereum.sfrxETH;
const ANKRETH = '0xe95a203b1a91a908f9b9ce46459d101078c2c3cb';
const SWETH = '0xf951e335afb289353dc249e82926178eac7ded78';
const STAFI = '0x9559aaa82d9649c7a7b220e7c461d2e74c9a3593';

// afETH
const AFETH = '0x0000000016E6Cb3038203c1129c8B4aEE7af7a11';
const CVX = '0x4e3fbd56cd56c3e72c1403e103b45db9da5b9d2b';
const VOTIUM = '0x00000069aBbB0B1Ad6975bcF753eEe15D318A0BF';

const getAllTVLs = async () => {
  const totalBalance = {};
  // safETH Balances
  await sumTokens(totalBalance, [
    [WSTETH, '0x972a53e3a9114f61b98921fb5b86c517e8f23fad'],
    [RETH, '0x7b6633c0cd81dc338688a528c0a3f346561f5ca3'],
    [SFRXETH, '0x36ce17a5c81e74dc111547f5dffbf40b8bf6b20a'],
    [ANKRETH, '0xf4A1735505188DAf0872312Dd1A6182d342ea981'],
    [SWETH, '0xF5cCaF2Dbed6c7Ae341Df42a9a74E057e9df3D09'],
    [STAFI, '0xAd0e8EdBDabDC4dd204b49F73511C1a13a8797CC'],
  ]);

  // afETH Balances
  await sumTokens(totalBalance, [[SFRXETH, AFETH]]);
  const votiumAvailableCVX = (
    await sdk.api.abi.call({
      abi: {
        inputs: [],
        name: 'availableCvx',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
      },
      target: VOTIUM,
    })
  ).output;
  totalBalance[CVX] = votiumAvailableCVX;

  return totalBalance;
};

module.exports = {
  methodology: 'counts tvl on both afETH and safETH',
  ethereum: {
    tvl: () => getAllTVLs(),
  },
};
