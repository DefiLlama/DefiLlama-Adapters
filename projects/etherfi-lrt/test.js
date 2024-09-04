const { ethereum } = require('./index.js');

async function testTVL() {
  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const block = 'latest';

    const result = await ethereum.tvl(timestamp, block);
    console.log('TVL Result:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}

testTVL();