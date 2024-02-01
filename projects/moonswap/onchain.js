const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const factoryAbi = require("../helper/abis/factory.json");
const token0 = 'address:token0'
const token1 = 'address:token1'
const getReserves = 'function getReserves() view returns (uint112 _reserve0, uint112 _reserve1, uint32 _blockTimestampLast)'

async function tvl(timestamp, ethBlock, chainBlocks) {
    let balances = {};
    let factoryAddress = '0x056973F631A5533470143bB7010C9229C19C04d2'

    // GET NUMBER OF POOLS FROM FACTORY
    const pairLength = Number((
        await sdk.api.abi.call({
            target: factoryAddress,
            abi: factoryAbi.allPairsLength,
            chain: 'moonriver',
            block: chainBlocks['moonriver'],
        })
    ).output);
    const allPairNums = Array.from(Array(pairLength).keys());

    // GET POOL ADDRESSES
    const pairs = await sdk.api.abi.multiCall({
        abi: factoryAbi.allPairs,
        chain: 'moonriver',
        calls: allPairNums.map((num) => ({
            target: factoryAddress,
            params: [num],
            })),
        });
    const pairAddresses = pairs.output.map(r => r.output.toLowerCase())

    // FIND TOKEN BALANCES
    const [token0Addresses, token1Addresses, reserves] = await Promise.all([
        sdk.api.abi
          .multiCall({
            abi: token0,
            chain: 'moonriver',
            calls: pairAddresses.map((pairAddress) => ({
              target: pairAddress,
            })),
            block: chainBlocks['moonriver'],
          })
          .then(({ output }) => output),
        sdk.api.abi
          .multiCall({
            abi: token1,
            chain: 'moonriver',
            calls: pairAddresses.map((pairAddress) => ({
              target: pairAddress,
            })),
            block: chainBlocks['moonriver'],
          })
          .then(({ output }) => output),
        sdk.api.abi
          .multiCall({
            abi: getReserves,
            chain: 'moonriver',
            calls: pairAddresses.map((pairAddress) => ({
              target: pairAddress,
            })),
            block: chainBlocks['moonriver'],
          })
          .then(({ output }) => output),
      ]);

    // CALCULATE VALUE OF POOLS WRT TOKENS OF KNOWN VALUE 
    for (let n = 0; n < pairLength; n++) {
        const tokenIds = [
            getTokenId(token0Addresses[n].output.toLowerCase()),
            getTokenId(token1Addresses[n].output.toLowerCase())
        ];
        
        const tokenId = tokenIds[0] ? tokenIds[0] : tokenIds[1];
        const side = tokenIds[0] ? 0 : 1;

        if (!tokenId) {
            continue;
        } else if (balances[tokenId[0]]) {
            balances[tokenId[0]] = Number(balances[tokenId[0]]) 
                + Number(reserves[n].output[side]) * 2 / 10**tokenId[1];
        } else {
            balances[tokenId[0]] =
                reserves[n].output[side] * 2 / 10**tokenId[1];
        }
    }
    return balances;
}

function getTokenId(address) {
    switch(address) {
        case '0x98878b06940ae243284ca214f92bb71a2b032b8a':
            return ['moonriver', 18]
        case [ADDRESSES.moonriver.USDC]:
            return ['usd-coin', 6]
        case [ADDRESSES.moonriver.USDT]:
            return ['tether', 6]
        case [ADDRESSES.moonriver.ETH]:
            return ['ethereum', 18]
        case '0x5d9ab5522c64e1f6ef5e3627eccc093f56167818':
            return ['binance-usd', 18]
        default:
            return false;
    }
}
// node test.js projects/moonswap/index.js
module.exports = {
    misrepresentedTokens: true,
    tvl,
    methodology: 'tvl is calculated by summing the value of moonswap pools that contain at least one of MOVR, USDC, USDT, ETH and BUSD. This is read from the blockchain, accounts for most of the value locked in the AMM, and was done because these tokens can be valued on CoinGecko. Currently, staking is not counted due to most moonriver tokens being difficult to value in USD.'
  };