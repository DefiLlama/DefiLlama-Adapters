const { ethereum } = require('./index.js');

async function testTVL() {
  try {
    // Use a recent timestamp and block number
    const timestamp = Math.floor(Date.now() / 1000);
    const block = 'latest'; // Or use a specific block number

    const result = await ethereum.tvl(timestamp, block);
    console.log('TVL Result:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}

testTVL();