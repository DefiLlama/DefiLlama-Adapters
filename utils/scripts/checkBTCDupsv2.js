const addressBook = require('../../projects/helper/bitcoin-book/index');

console.log('project count: ', Object.keys(addressBook).length);
const addressProjectMap = {}

async function run() {

  await Promise.all(Object.keys(addressBook).map(async project => {
    let addresses = addressBook[project];
    if (!Array.isArray(addresses)) addresses = await addresses()
    for (let address of addresses) {
      if (addressProjectMap[address]) {
        addressProjectMap[address].push(project);
      } else {
        addressProjectMap[address] = [project];
      }
    }
  }))

  const duplicates = {}
  for (const [address, projects] of Object.entries(addressProjectMap)) {
    if (projects.length > 1) {
      duplicates[address] = projects.join(', ');
    }
  }

  console.table(Object.entries(duplicates));
}

run().catch(console.error).then(() => process.exit(0));