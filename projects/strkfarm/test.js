import data from './data.json' assert { type: 'json' };

let totalVolume = 0n;

for (const entry of data.data) {
    totalVolume += BigInt(entry.volume);
}

console.log("Total Volume:", totalVolume.toString());