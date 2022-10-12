import * as path from 'path'
import type { Adapter, ChainBlocks, VolumeAdapter } from '../dexVolume.type';
import { chainsForBlocks } from "@defillama/sdk/build/computeTVL/blocks";
import { Chain } from '@defillama/sdk/build/general';
import handleError from '../../utils/handleError';
import { checkArguments, ERROR_STRING, formatTimestampAsDate, printVolumes } from './utils';
import { getBlock } from '../helper/getBlock';
import { getUniqStartOfTodayTimestamp } from '../helper/getUniSubgraphVolume';
require('dotenv').config()

// Add handler to rejections/exceptions
process.on('unhandledRejection', handleError)
process.on('uncaughtException', handleError)

// Check if all arguments are present
checkArguments(process.argv)

// Get path of module import
const passedFile = path.resolve(process.cwd(), `volumes/adapters/${process.argv[2]}`);
(async () => {
  try {
    console.info(`🦙 Running ${process.argv[2].toUpperCase()} adapter 🦙`)
    console.info(`_______________________________________`)
    // Import module to test
    let module: VolumeAdapter = (await import(passedFile)).default
    getUniqStartOfTodayTimestamp
    const unixTimestamp = +process.argv[3] || getUniqStartOfTodayTimestamp(new Date()) - 1;
    console.info(`Volume for ${formatTimestampAsDate(String(unixTimestamp))}`)
    console.info(`_______________________________________\n`)
    if ("volume" in module) {
      // Get adapter
      const volumes = await runAdapter(module.volume, unixTimestamp)
      printVolumes(volumes)
      console.info("\n")
    } else if ("breakdown" in module) {
      const breakdownAdapter = module.breakdown
      const allVolumes = await Promise.all(Object.entries(breakdownAdapter).map(async ([version, adapter]) =>
        await runAdapter(adapter, unixTimestamp).then(res => ({ version, res }))
      ))
      allVolumes.forEach((promise) => {
        console.info("Version ->", promise.version.toUpperCase())
        console.info("---------")
        printVolumes(promise.res)
        console.info("\n")
      })
      process.exit(0);
    } else throw new Error("No compatible adapter found")
  } catch (error) {
    console.error(ERROR_STRING)
    console.error(error)
  }
})()

async function runAdapter(volumeAdapter: Adapter, timestamp: number) {
  // Get chains to check
  const chains: Chain[] = Object.keys(volumeAdapter).filter(item => typeof volumeAdapter[item] === 'object').map(c => c === "ava" ? "avax" : c as Chain)
  // Get lastest block
  const chainBlocks: ChainBlocks = {};
  await Promise.all(
    chains.map(async (chain) => {
      if (chainsForBlocks.includes(chain as Chain) || chain === "ethereum") {
        const latestBlock = await getBlock(timestamp, chain, chainBlocks)
        if (latestBlock)
          chainBlocks[chain] = latestBlock - 15
      }
    })
  );
  // Get volumes
  const volumes = await Promise.all(chains.map(
    async chain => {
      const startTimestamp = await volumeAdapter[chain].start()
      const fetchVolumeFunc = volumeAdapter[chain].customBackfill ?? volumeAdapter[chain].fetch
      return fetchVolumeFunc(timestamp, chainBlocks)
        .then(res => ({ timestamp: res.timestamp, totalVolume: res.totalVolume, dailyVolume: res.dailyVolume, chain, startTimestamp })).catch(e => {
          throw new Error(`${process.argv[2]} ${timestamp}, ${chainBlocks} ${chain} ${e.message}`)
        })
    }
  ))
  return volumes
}
