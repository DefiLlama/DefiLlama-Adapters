const HubPoolAbi = {
  getDepositData: "function getDepositData() view returns (uint16 optimalUtilisationRatio, uint256 totalAmount, uint256 interestRate, uint256 interestIndex)",
  getVariableBorrowData: "function getVariableBorrowData() view returns (uint32 vr0, uint32 vr1, uint32 vr2, uint256 totalAmount, uint256 interestRate, uint256 interestIndex)",
  getStableBorrowData: "function getStableBorrowData() view returns (uint32 sr0, uint32 sr1, uint32 sr2, uint32 sr3, uint16 optimalStableToTotalDebtRatio, uint16 rebalanceUpUtilisationRatio, uint16 rebalanceUpDepositInterestRate, uint16 rebalanceDownDelta, uint256 totalAmount, uint256 interestRate, uint256 averageInterestRate)"
}
const HubChainId = 'avax'

const HubPools = {
  'avax': [
    {
      id: "USDC",
      poolAddress: "0x88f15e36308ED060d8543DA8E2a5dA0810Efded2",
      tokenAddress: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
      chain: "avax",
    },
    {
      id: "AVAX",
      poolAddress: "0x0259617bE41aDA4D97deD60dAf848Caa6db3F228",
      tokenAddress: "0x0000000000000000000000000000000000000000",
      chain: "avax",
    },
    {
      id: "sAVAX",
      poolAddress: "0x7033105d1a527d342bE618ab1F222BB310C8d70b",
      tokenAddress: "0x2b2C81e08f1Af8835a78Bb2A90AE924ACE0eA4bE",
      chain: "avax",
    },
    {
      id: "wETH_ava",
      poolAddress: "0x795CcF6f7601edb41E4b3123c778C56F0F19389A",
      tokenAddress: "0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB",
      chain: "avax",
    },
    {
      id: "BTCb_ava",
      poolAddress: "0x1C51AA1516e1156d98075F2F64e259906051ABa9",
      tokenAddress: "0x152b9d0FdC40C096757F570A51E494bd4b943E50",
      chain: "avax",
    },
  ],
  'ethereum': [
    // excluding USDC cause bridged
    {
      id: "ETH_eth",
      poolAddress: "0xB6DF8914C084242A19A4C7fb15368be244Da3c75",
      tokenAddress: "0x0000000000000000000000000000000000000000",
      chain: "ethereum",
    },
    {
      id: "wBTC_eth",
      poolAddress: "0x9936812835476504D6Cf495F4F0C718Ec19B3Aff",
      tokenAddress: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
      chain: "ethereum",
    },
  ],
  'base': [
    // excluding USDC cause bridged
    {
      id: "ETH_base",
      poolAddress: "0x51958ed7B96F57142CE63BB223bbd9ce23DA7125",
      tokenAddress: "0x0000000000000000000000000000000000000000",
      chain: "base",
    },
  ]
}

module.exports = {
  HubPoolAbi,
  HubChainId,
  HubPools,
};
