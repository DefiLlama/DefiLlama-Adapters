const { get } = require("../../projects/helper/http");

const addressBook = {
  bigpump: 'https://tonfunstats-eqnd7.ondigitalocean.app/api/v1/getServiceTokens?service=bigpump',
  blum: 'https://tonfunstats-eqnd7.ondigitalocean.app/api/v1/getServiceTokens?service=blum',
  wagmi: 'https://tonfunstats-eqnd7.ondigitalocean.app/api/v1/getServiceTokens?service=wagmi',
  tonpump: 'https://tonfunstats-eqnd7.ondigitalocean.app/api/v1/getServiceTokens?service=hot',
}

console.log('project count: ', Object.keys(addressBook).length);
const addressProjectMap = {}

async function run() {

  await Promise.all(Object.keys(addressBook).map(async project => {
    let addresses = await get(addressBook[project]);
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

  console.log('Ton meme duplicates count: ', Object.keys(duplicates).length);
  console.table(Object.entries(duplicates));
}

run().catch(console.error).then(() => process.exit(0));