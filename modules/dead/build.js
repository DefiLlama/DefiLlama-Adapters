// go through projects folder, if an export returns deadFrom field, delete that file/listing and add it's config to dead.json

const deadConfig = require('./config.json');
const { getAllAdapters, mockFunctions, sortJSONByKeyAndStoreFile } = require('../util.js');

const allAdadpters = getAllAdapters()

const deadAdapterEntries = Object.entries(allAdadpters).filter(([key, value]) => value.deadFrom)
const adaptersWithFetch = Object.entries(allAdadpters).filter(([key, value]) => {
  if (value.fetch) return true
  return Object.values(value).some(v => typeof v === 'object' && v.fetch)
})
const adaptersWithTvlAtRootLevel = Object.entries(allAdadpters).filter(([key, value]) => value.tvl || value.pool2 || value.staking)


if (adaptersWithFetch.length)
  console.log(`Found ${adaptersWithFetch.length} adapters with fetch function.`, adaptersWithFetch.map(([key]) => key).join('\n'));
if (adaptersWithTvlAtRootLevel.length)
  console.log(`Found ${adaptersWithTvlAtRootLevel.length} adapters with tvl/pool2/staking at root level.`, adaptersWithTvlAtRootLevel.map(([key]) => key).join('\n'));


if (deadAdapterEntries.length)
  console.log(`Found ${deadAdapterEntries.length} dead adapters.`);
else 
  process.exit(0);
deadAdapterEntries.forEach(([key, value]) => {
  deadConfig[key] = mockFunctions(value)
})

sortJSONByKeyAndStoreFile(deadConfig, __dirname + '/config.json')