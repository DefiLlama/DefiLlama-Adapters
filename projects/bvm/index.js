const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')
const { getCoreAssets } = require('../helper/tokenMapping')
const sdk = require('@defillama/sdk')

const { uniV3Export } = require('../helper/uniswapV3')

const uniExports = uniV3Export({
  nos: {
    factory: '0x1d12AC81710da54A50e2e9095E20dB2D915Ce3C8', fromBlock: 320282, sumChunkSize: 50, filterFn: async (api, logs) => {
      const tokens = logs.map(i => [i.token0, i.token1]).flat()
      const coreAssets = new Set(getCoreAssets(api.chain))
      return tokens.filter(i => !coreAssets.has(i.toLowerCase()))
    }
  },
})

const tokenTotalSupply = async(contractAddress) => {
  return async (timestamp, block) => {
    return {
      [contractAddress]: (
          await sdk.api.erc20.totalSupply({
            block,
            target: contractAddress,
          })
      ).output,
    };
  };
};

const getTVLNativeTokenBridge = async(chainBlocks) => {
    const { output } = await sdk.api.eth.getBalance({ target: '0x694A7eF60ACe282E2a55a9bc6AdD56730e5Ee8B6', chain: 'naka', block: chainBlocks.naka })
    
    // BTC is native token of Naka ChainChain
    // BTC TVL: 21M pre_minted - leftBalance (which is unlocked for users)
    return (BigInt("0x115EEC47F6CF7E35000000") - BigInt(output)).toString();
}

module.exports = {
  // todo: test below export
  bvm: {
    tvl: sdk.util.sumChainTvls([
        sumTokensExport({ owner: '0xea21fbBB923E553d7b98D14106A104665BA57eCd', tokens: [ADDRESSES.nos.BTC] }),
        uniExports.nos.tvl,
        tokenTotalSupply(ADDRESSES.naka.ETH),
        tokenTotalSupply(ADDRESSES.naka.SATS),
        tokenTotalSupply(ADDRESSES.naka.ORDI),
        getTVLNativeTokenBridge
    ])
  }
}