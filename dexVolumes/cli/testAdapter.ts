import path from 'path'
import type { ChainBlocks, DexAdapter } from '../dexVolume.type';
import { chainsForBlocks } from "@defillama/sdk/build/computeTVL/blocks";
import { Chain } from '@defillama/sdk/build/general';
import handleError from '../../utils/handleError';
import { checkArguments, getLatestBlockRetry } from './utils';

// Add handler to rejections/exceptions
process.on('unhandledRejection', handleError)
process.on('uncaughtException', handleError)

// Check if all arguments are present
checkArguments(process.argv)

// Get path of module import
const passedFile = path.resolve(process.cwd(), process.argv[2]);
(async () => {
  console.info(`Running ${process.argv[2].slice("dexVolumes/".length).toUpperCase()} adapter`)
  // Import module to test
  let module: DexAdapter = (await import(passedFile)).default

  if ("volume" in module) {
    // Get adapter
    const volumeAdapter = module.volume
    // Get chains to check
    const chains = Object.keys(volumeAdapter).filter(item => typeof volumeAdapter[item] === 'object');
    // Get lastest block 
    const chainBlocks: ChainBlocks = {};
    await Promise.all(
      chains.map(async (chainRaw) => {
        const chain: Chain = chainRaw === "ava" ? "avax" : chainRaw as Chain
        if (chainsForBlocks.includes(chain as Chain) || chain === "ethereum") {
          const latestBlock = await getLatestBlockRetry(chain)
          if (!latestBlock) throw new Error("latestBlock")
          chainBlocks[chain] = latestBlock.number - 10;
        }
      })
    );

    const unixTimestamp = Math.round(Date.now() / 1000) - 60;
    const dailyVolumes = await Promise.all(Object.keys(chainBlocks).map(chain => {
      return volumeAdapter[chain].fetch(unixTimestamp, chainBlocks).then(res => ({ chain, totalVolume: res.totalVolume, dailyVolume: res.dailyVolume }))
    }))
    dailyVolumes.forEach(element => {
      console.info("----------")
      console.log(`${element.chain.toUpperCase()}`)
      console.log(`Daily: ${element.dailyVolume}`)
      console.log(`Total: ${element.totalVolume}`)
      console.info("----------")
    });
  } else {
    console.info("No volume")
  }
})()
