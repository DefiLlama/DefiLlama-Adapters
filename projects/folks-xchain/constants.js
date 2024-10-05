const HubPoolAbi = {
  getDepositData: "function getDepositData() view returns (uint16 optimalUtilisationRatio, uint256 totalAmount, uint256 interestRate, uint256 interestIndex)",
  getVariableBorrowData: "function getVariableBorrowData() view returns (uint32 vr0, uint32 vr1, uint32 vr2, uint256 totalAmount, uint256 interestRate, uint256 interestIndex)",
  getStableBorrowData: "function getStableBorrowData() view returns (uint32 sr0, uint32 sr1, uint32 sr2, uint32 sr3, uint16 optimalStableToTotalDebtRatio, uint16 rebalanceUpUtilisationRatio, uint16 rebalanceUpDepositInterestRate, uint16 rebalanceDownDelta, uint256 totalAmount, uint256 interestRate, uint256 averageInterestRate)"
}
const HubPools = {
  'avax': [
    { // USDC      
      poolAddress: "0x88f15e36308ED060d8543DA8E2a5dA0810Efded2",
      tokenAddress: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
    },
    { // AVAX      
      poolAddress: "0x0259617bE41aDA4D97deD60dAf848Caa6db3F228",
      tokenAddress: "0x0000000000000000000000000000000000000000",
      chainPoolAddress: '0xe69e068539Ee627bAb1Ce878843a6C76484CBd2c',
    },
    { // sAVAX      
      poolAddress: "0x7033105d1a527d342bE618ab1F222BB310C8d70b",
      tokenAddress: "0x2b2C81e08f1Af8835a78Bb2A90AE924ACE0eA4bE",
      chainPoolAddress: '0x23a96D92C80E8b926dA40E574d615d9e806A87F6',
    },
    { // wETH_ava      
      poolAddress: "0x795CcF6f7601edb41E4b3123c778C56F0F19389A",
      tokenAddress: "0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB",
      chainPoolAddress: '0x0e563B9fe6D9EF642bDbA20D53ac5137EB0d78DC',
    },
    { // BTCb_ava      
      poolAddress: "0x1C51AA1516e1156d98075F2F64e259906051ABa9",
      tokenAddress: "0x152b9d0FdC40C096757F570A51E494bd4b943E50",
      chainPoolAddress: '0xef7a6EBEDe2ad558DB8c36Df65365b209E5d57dC',
    },
  ],
  'ethereum': [
    // excluding USDC cause bridged
    { // ETH_eth      
      poolAddress: "0xB6DF8914C084242A19A4C7fb15368be244Da3c75",
      tokenAddress: "0x0000000000000000000000000000000000000000",
      chainPoolAddress: '0xe3B0e4Db870aA58A24f87d895c62D3dc5CD05883',
    },
    { // wBTC_eth      
      poolAddress: "0x9936812835476504D6Cf495F4F0C718Ec19B3Aff",
      chainPoolAddress: "0xb39c03297E87032fF69f4D42A6698e4c4A934449",
      tokenAddress: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
    },
  ],
  'base': [
    // excluding USDC cause bridged
    { // ETH_base      
      poolAddress: "0x51958ed7B96F57142CE63BB223bbd9ce23DA7125",
      tokenAddress: "0x0000000000000000000000000000000000000000",
      chainPoolAddress: '0xe3B0e4Db870aA58A24f87d895c62D3dc5CD05883',
    },
  ]
}

module.exports = {
  HubPoolAbi,
  HubPools,
};
