const sdk = require('@defillama/sdk');
const { BigNumber } = require('bignumber.js');

const StEthVaultContract = '0xfc85db895e070017ab9c84cb65b911d56b729ee9';
const StEthPool = "0x1982b2F5814301d4e9a8b0201555376e62F82428";
const WEthPool = "0x030bA81f1c18d280636F32af80b9AAd02Cf0854e";
const LensContract = "0x507fA343d0A90786d86C7cd885f5C49263A91FF4";

async function tvl(_, _1, _2, { api }) {
  const balances = {};

  const StEthSupplied = await api.call({
    abi: 'function getCurrentSupplyBalanceInOf(address _poolToken, address _user) external view returns ( uint256 balanceInP2P, uint256 balanceOnPool, uint256 totalBalance )',
    target: LensContract,
    params: [StEthPool, StEthVaultContract],
  });
  
  const WEthSupplied = await api.call({
    abi: 'function getCurrentBorrowBalanceInOf(address _poolToken, address _user) external view returns ( uint256 balanceInP2P, uint256 balanceOnPool, uint256 totalBalance )',
    target: LensContract,
    params: [WEthPool, StEthVaultContract],
  });
  
  const stEthSuppliedBN = new BigNumber(StEthSupplied[2]);
  const wEthSuppliedBN = new BigNumber(WEthSupplied[2]);
  const TVL = stEthSuppliedBN.plus(wEthSuppliedBN);
    
  return {
    'ethereum:0x0000000000000000000000000000000000000000': TVL.toString()
  };
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: 'TVL calculation methodology involves accounting for the total value of assets engaged in our protocol, which encompasses both staked and leveraged positions, as well as the assets borrowed through flashloans. To compute the Total Value Locked (TVL), we sum up the total amount of stETH staked in the protocol (Total_Staked_stETH), the leveraged amount of stETH used as collateral for borrowed assets (Leveraged_stETH), and the total value of assets borrowed via flashloans (Total_Borrowed_Assets).',
  ethereum: {
    tvl,
  }
}; 