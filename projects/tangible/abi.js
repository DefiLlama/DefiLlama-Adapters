module.exports = {
  apGetAddress: "function getAddress(bytes32) view returns (address)",
  getPriceManager: "address:priceManager",
  getCategories: "address[]:getCategories",
  getTreasuryValue: "function getTreasuryValue() view returns (tuple(uint256 stable, uint256 usdr, uint256 rwa, uint256 tngbl, uint256 liquidity, tuple(uint256 tngbl, uint256 underlying, uint256 liquidity) tngblLiquidity, uint256 debt, uint256 total, uint256 rwaVaults, uint256 rwaEscrow, bool rwaValueNotLatest) value)",
  getTotalSupply: "uint256:totalSupply",
  getTokenByIndex: "function tokenByIndex(uint256 index) view returns (uint256)",
  getTnftCustody: "function tnftCustody(uint256) view returns (bool)",
  getItemPriceBatchTokenIds: "function itemPriceBatchTokenIds(address nft, address paymentUSDToken, uint256[] tokenIds) view returns (uint256[] weSellAt, uint256[] weSellAtStock, uint256[] weBuyAt, uint256[] weBuyAtStock, uint256[] lockedAmount)",
  getPair: {
    "inputs": [
      {
        "internalType": "address",
        "name": "_pair",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_account",
        "type": "address"
      }
    ],
    "name": "getPair",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "pair_address",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "symbol",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "name",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "decimals",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "stable",
            "type": "bool"
          },
          {
            "internalType": "uint256",
            "name": "total_supply",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "token0",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "token0_symbol",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "token0_decimals",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "reserve0",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "claimable0",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "token1",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "token1_symbol",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "token1_decimals",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "reserve1",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "claimable1",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "gauge",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "gauge_total_supply",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "fee",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "bribe",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "emissions",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "emissions_token",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "emissions_token_decimals",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "account_lp_balance",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "account_token0_balance",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "account_token1_balance",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "account_gauge_balance",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "account_gauge_earned",
            "type": "uint256"
          }
        ],
        "internalType": "struct PairAPI.pairInfo",
        "name": "_pairInfo",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
}