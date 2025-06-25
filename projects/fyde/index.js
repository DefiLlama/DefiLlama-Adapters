const ADDRESSES = require('../helper/coreAssets.json')

const FYDE_CONTRACT = "0x87Cc45fFF5c0933bb6aF6bAe7Fc013b7eC7df2Ee";
const RESTAKING_AGGREGATOR = "0x3f69F62e25441Cf72E362508f4d6711d53B05341";
const DEPOSIT_ESCROW = "0x63ec950633Eb85797477166084AD0a7121910470";
const ORACLE = "0x05198327206123E89c24ABd9A482316449bD2aEe"
const WETH = ADDRESSES.ethereum.WETH;
const YIELDMANAGER = "0xB615A7E4D1Ed426470Ac2Df14F3153fA2DcCC3ba"
const PTTOKENS = ["0x1c085195437738d73d75DC64bC5A3E098b7f93b1", "0x6ee2b5e19ecba773a352e5b21415dc419a700d1d"]

async function tvl(api) {
  const tokens = await api.fetchList({ lengthAbi: 'getAssetsListLength', itemAbi: 'assetsList', target: FYDE_CONTRACT })
  const bals = await api.multiCall({  abi: 'function totalAssetAccounting(address) view returns (uint256)', calls: tokens, target: FYDE_CONTRACT })

  // add restaking aggregator TVL
  const amountStakedETH = await api.call({
    abi: 'erc20:totalSupply',
    target: RESTAKING_AGGREGATOR,
    params: [],
  });

  api.add(WETH, amountStakedETH)

  // add tokens deployed to yield module. Check which token from tokens is a yield-token, map to the underlying and 
  // add balances to TVL
  const response = await api.multiCall({
    target: ORACLE,
    calls: tokens,
    abi: 'function yieldTokenToToken(address) external view returns (address)',
  })
  const decimals = await api.multiCall({  abi: 'uint8:decimals', calls: tokens})

  for (let i = 0; i < tokens.length; i++) {
    if (response[i] !== ADDRESSES.null) {
      const balance = bals[i] / 10 ** (decimals[i] - 18)
      api.add(response[i], balance)
    } else 
      api.add(tokens[i], bals[i])
  }

  // add assets in the deposit escrow
  const tokensEscrow = await api.fetchList({ lengthAbi: 'getAssetListLength', itemAbi: 'assetList', target: DEPOSIT_ESCROW })
  return api.sumTokens({ ownerTokens: [
    [tokensEscrow, DEPOSIT_ESCROW],
    [PTTOKENS, YIELDMANAGER],
  ],})
}

module.exports = {
  methodology: 'Read out balances from internal accounting for each asset in Fyde, the YieldModule and the DepositEscrow. Add ETH staked in LRT Aggregator.',
  ethereum: {
    tvl
  }
};