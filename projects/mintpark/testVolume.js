const adapter = require('./index.js');

async function testFetch() {
  const api = {
    chain: 'hemi',
  };

  if (adapter.hemi && typeof adapter.hemi.fetch === 'function') {
    const result = await adapter.hemi.fetch(api);
    console.log('Fetch result:', result);
  } else {
    console.error('Fetch function not found in adapter.');
  }
}

testFetch();
