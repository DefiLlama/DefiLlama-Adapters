import * as path from 'path'
import type { ChainBlocks, DexAdapter, VolumeAdapter } from '../dexVolume.type';
import { chainsForBlocks } from "@defillama/sdk/build/computeTVL/blocks";
import { Chain } from '@defillama/sdk/build/general';
import handleError from '../../utils/handleError';
import { checkArguments, printVolumes } from './utils';
import { getBlock } from '../../projects/helper/getBlock';

// Add handler to rejections/exceptions
process.on('unhandledRejection', handleError)
process.on('uncaughtException', handleError)

// Check if all arguments are present
checkArguments(process.argv)

// Get path of module import
const passedFile = path.resolve(process.cwd(), `dexVolumes/${process.argv[2]}`);
(async () => {
  console.info(`Running ${process.argv[2].toUpperCase()} adapter`)
  // Import module to test
  let module: DexAdapter = (await import(passedFile)).default

  const unixTimestamp = +process.argv[3] || Math.round(Date.now() / 1000) - 60;
  if ("volume" in module) {
    // Get adapter
    const volumeAdapter = module.volume
    const volumes = await runAdapter(volumeAdapter, unixTimestamp)
    printVolumes(volumes)
  } else if ("breakdown" in module) {
    const breakdownAdapter = module.breakdown
    const allVolumes = await Promise.all(Object.entries(breakdownAdapter).map(async ([version, adapter]) =>
      await runAdapter(adapter, unixTimestamp).then(res => ({ version, res }))
    ))
    allVolumes.forEach((promise) => {
      console.info(promise.version)
      printVolumes(promise.res)
    })
  } else console.info("No compatible adapter found")
})()

async function runAdapter(volumeAdapter: VolumeAdapter, timestamp: number) {
  // Get chains to check
  const chains = Object.keys(volumeAdapter).filter(item => typeof volumeAdapter[item] === 'object');
  // Get lastest block 
  const chainBlocks: ChainBlocks = {};
  await Promise.all(
    chains.map(async (chainRaw) => {
      const chain: Chain = chainRaw === "ava" ? "avax" : chainRaw as Chain
      if (chainsForBlocks.includes(chain as Chain) || chain === "ethereum") {
        const latestBlock = await getBlock(timestamp, chain, chainBlocks)
        if (!latestBlock) throw new Error("latestBlock")
        chainBlocks[chain] = latestBlock - 10
      }
    })
  );
  // Get volumes
  const volumes = await Promise.all(Object.keys(chainBlocks).map(
    async chain => {
      const fetchVolumeFunc = volumeAdapter[chain].customBackfill ?? volumeAdapter[chain].fetch
      return fetchVolumeFunc(timestamp, chainBlocks)
        .then(res => ({ timestamp: res.timestamp, totalVolume: res.totalVolume, dailyVolume: res.dailyVolume }))
    }
  ))
  return volumes
}