const sdk = require("@defillama/sdk");
const { getLogs2 } = require("../helper/cache/getLogs");
const {
  config: {
    RootPort,
    chainToLZChainID,
    nativeTokenPerChain,
    EVM_CHAIN_ID_FROM_LZ_CHAIN_ID,
    CHAINS,
  },
} = require("./config");

async function tvl(api) {
  const arbitrumApi = new sdk.ChainApi({ chain: 'arbitrum', timestamp: api.timestamp })

  const logs = await getLogs2({
    api: arbitrumApi,
    target: RootPort,
    fromBlock: 241817312,
    eventAbi: "event LocalTokenAdded(address indexed underlyingAddress, address indexed localAddress, address indexed globalAddress, uint256 chainId)",
  });

  const tokens = []
  const uTokens = []
  logs.forEach((log) =>  {
    const chain = EVM_CHAIN_ID_FROM_LZ_CHAIN_ID[log.chainId.toString()];
    console.log(log.chainId, chain, log.chainId.toString())
    if (!chain) return;
    const uToken = `${chain}:${log.underlyingAddress}`; 
    tokens.push(log.globalAddress);
    uTokens.push(uToken);
  })
  const bals  = (await api.multiCall({  abi: 'erc20:totalSupply', calls: tokens, permitFailure: true })).map(i => i ?? 0)

  console.log(tokens, uTokens, bals, api.chain)
  api.add(uTokens, bals, { skipChain: true });
}

CHAINS.forEach(chain => module.exports[chain] = { tvl, })
module.exports.arbitrum = { tvl, }
