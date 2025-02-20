const sdk = require('@defillama/sdk')
const addressBook = require('../../projects/helper/bitcoin-book/index');
const Bucket = "tvl-adapter-cache";

console.log('project count: ', Object.keys(addressBook).length);
const addressProjectMap = {}

const storeInR2 = !!process.env.STORE_IN_R2

const projectData = {}

async function run() {

  await Promise.all(Object.keys(addressBook).map(async project => {

    try {


      let addresses = addressBook[project];
      if (!Array.isArray(addresses)) addresses = await addresses()


      if (storeInR2) {
        projectData[project] = addresses
        return;
      }


      for (let address of addresses) {
        if (addressProjectMap[address]) {
          addressProjectMap[address].push(project);
        } else {
          addressProjectMap[address] = [project];
        }
      }


    } catch (e) {
      console.error(`Error in ${project}: ${e}`)
    }
  }))




  if (storeInR2) {
    try {
      await sdk.cache.writeCache(`${Bucket}/bitcoin-addresses.json`, projectData)
      console.log('data written to s3 bucket');
    } catch (e) {
      sdk.log('failed to write data to s3 bucket: ')
      sdk.log(e)
    }
  } else {

    const duplicates = {}
    for (const [address, projects] of Object.entries(addressProjectMap)) {
      if (projects.length > 1) {
        duplicates[address] = projects.join(', ');
      }
    }

    console.table(Object.entries(duplicates));
  }
}

run().catch(console.error).then(() => process.exit(0));