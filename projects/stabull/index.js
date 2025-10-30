const sdk = require('@defillama/sdk');
const { getBlock } = require('../helper/http');

const ABIS = {
 newCurve: 'event NewCurve(address indexed caller, bytes32 indexed id, address indexed curve)',
 liquidity: 'function liquidity() view returns (uint256 total, uint256[] individual)',
};

function tvlFactory(factory, fromBlock) {
 return async (timestamp, ethBlock, chainBlocks, { api }) => {
   const block = await getBlock(timestamp, api.chain, chainBlocks);

   const CHUNK_SIZE = 500000;
   const allLogs = [];
   let currentBlock = fromBlock;

   while (currentBlock < block) {
     const toBlock = Math.min(currentBlock + CHUNK_SIZE, block);
     const logs = await api.getLogs({
       target: factory,
       eventAbi: ABIS.newCurve,
       fromBlock: currentBlock,
       toBlock,
     });
     allLogs.push(...logs);
     currentBlock = toBlock + 1;
   }

const pools = allLogs.map((log) => log.args.curve);

// remove addresses - closed pools & exclusions
const addressesToRemove = [
 '0x369148007c7D55d82A04b5C23271EcB3ac35efe4',
 '0x1233003461F654cf1c0d7dB19e753BAdef05A87f',
 '0x402878106B88B41Fad1200b47E998c8eFfD0D887'
];
const updatedPools = pools.filter((address) => !addressesToRemove.includes(address));
  
   const liquidities = await api.multiCall({
     calls: updatedPools.map((pool) => ({ target: pool })),
     abi: ABIS.liquidity,
   });

   let totalTvl = 0;
   liquidities.forEach((liq) => {
     totalTvl += Number(liq.total) / 1e18;
   });

   return { usd: totalTvl };
 };
}

module.exports = {
 methodology: 'Sums the normalized total liquidity (in USD-equivalent) from all pools created by the factories. Pools are fetched from NewCurve event logs.',
 ethereum: {
   tvl: tvlFactory('0x2e9E34b5Af24b66F12721113C1C8FFcbB7Bc8051', 19773852),
 },
 polygon: {
   tvl: tvlFactory('0x3c60234db40e6e5b57504e401b1cdc79d91faf89', 56377840),
 },
 base: {
   tvl: tvlFactory('0x86Ba17ebf8819f7fd32Cf1A43AbCaAe541A5BEbf', 32584321),
 },
};
