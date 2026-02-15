
const { isLP } = require('./utils');
const { describe, it } = require('node:test');
const assert = require('node:assert');

describe('isLP', () => {
  it('should return false if symbol is missing or empty', () => {
    assert.strictEqual(isLP(undefined, '0x123', 'ethereum'), false);
    assert.strictEqual(isLP(null, '0x123', 'ethereum'), false);
    assert.strictEqual(isLP('', '0x123', 'ethereum'), false);
  });

  it('should return false for blacklisted LP tokens', () => {
    // 0xb3dc4accfe37bd8b3c2744e9e687d252c9661bc7 is in blacklisted_LPS
    assert.strictEqual(isLP('SLP', '0xb3dc4accfe37bd8b3c2744e9e687d252c9661bc7', 'ethereum'), false);
    // Case insensitive check
    assert.strictEqual(isLP('SLP', '0xB3DC4ACCFE37BD8B3C2744E9E687D252C9661BC7', 'ethereum'), false);
  });

  it('should return false if symbol includes HOP-LP-', () => {
    assert.strictEqual(isLP('HOP-LP-USDC', '0x123', 'ethereum'), false);
  });

  it('should return false for specific BSC exclusions', () => {
    const exclusions = ['OLP', 'DLP', 'MLP', 'LP', 'Stable-LP', 'fCake-LP', 'fMDEX LP'];
    exclusions.forEach(symbol => {
      assert.strictEqual(isLP(symbol, '0x123', 'bsc'), false, `Expected ${symbol} on bsc to be false`);
    });
  });

  it('should return true for specific BSC inclusions', () => {
    const inclusions = ['WLP', 'FstLP', 'BLP', 'DsgLP'];
    inclusions.forEach(symbol => {
      assert.strictEqual(isLP(symbol, '0x123', 'bsc'), true, `Expected ${symbol} on bsc to be true`);
    });
  });

  it('should handle chain-specific inclusions correctly', () => {
    const cases = [
      { chain: 'pulse', symbol: 'PLP', expected: true },
      { chain: 'pulse', symbol: 'PLT', expected: true },
      { chain: 'avax', symbol: 'ELP', expected: true },
      { chain: 'avax', symbol: 'EPT', expected: true },
      { chain: 'avax', symbol: 'CRL', expected: true },
      { chain: 'avax', symbol: 'YSL', expected: true },
      { chain: 'avax', symbol: 'BGL', expected: true },
      { chain: 'avax', symbol: 'PLP', expected: true },
      { chain: 'ethereum', symbol: 'SSLP', expected: true },
      { chain: 'moonriver', symbol: 'HBLP', expected: true },
      { chain: 'ethpow', symbol: 'LFG_LP', expected: true },
      { chain: 'aurora', symbol: 'wLP', expected: true },
      { chain: 'oasis', symbol: 'LPT', expected: true },
      { chain: 'oasis', symbol: 'GLP', expected: true },
      { chain: 'iotex', symbol: 'MIMO-LP', expected: true },
      { chain: 'base', symbol: 'RCKT-V2', expected: true },
      { chain: 'wan', symbol: 'WSLP', expected: true },
      { chain: 'telos', symbol: 'zLP', expected: true },
      { chain: 'fuse', symbol: 'VLP', expected: true },
      { chain: 'polygon', symbol: 'MbtLP', expected: true },
      { chain: 'polygon', symbol: 'GLP', expected: true },
      { chain: 'polygon', symbol: 'WLP', expected: true },
      { chain: 'polygon', symbol: 'FLP', expected: true },
      { chain: 'dogechain', symbol: 'DST-V2', expected: true },
      { chain: 'harmony', symbol: 'HLP', expected: true },
      { chain: 'klaytn', symbol: 'NLP', expected: true },
      { chain: 'core', symbol: 'GLP', expected: true },
      { chain: 'kardia', symbol: 'KLP', expected: true },
      { chain: 'kardia', symbol: 'KDXLP', expected: true },
      { chain: 'fantom', symbol: 'HLP', expected: true },
      { chain: 'fantom', symbol: 'WLP', expected: true },
      { chain: 'functionx', symbol: 'FX-V2', expected: true },
      { chain: 'mantle', symbol: 'MoeLP', expected: true },
      { chain: 'blast', symbol: 'RING-V2', expected: true },
      { chain: 'fraxtal', symbol: 'FS-V2', expected: true },
      { chain: 'era', symbol: 'ANY-ZFLP', expected: true }, // regex /(ZFLP)$/
      { chain: 'flare', symbol: 'SOMETOKEN_LP', expected: true }, // endsWith('_LP')
      { chain: 'songbird', symbol: 'FLRX', expected: true },
      { chain: 'songbird', symbol: 'OLP', expected: true },
      { chain: 'arbitrum', symbol: 'DXS', expected: true },
      { chain: 'arbitrum', symbol: 'ZLP', expected: true },
      { chain: 'metis', symbol: 'NLP', expected: true },
      { chain: 'metis', symbol: 'ALP', expected: true },
      { chain: 'optimism', symbol: 'SOMETHING-ZS', expected: true }, // regex /(-ZS)/
      { chain: 'arbitrum', symbol: 'crAMM-LP', expected: true }, // regex /^(crAMM|vrAMM)-/
      { chain: 'arbitrum', symbol: 'vrAMM-LP', expected: true }, // regex /^(crAMM|vrAMM)-/
      { chain: 'base', symbol: 'v-LP', expected: true }, // regex /^(v|s)-/
      { chain: 'sonic', symbol: 's-LP', expected: true }, // regex /^(v|s)-/
      { chain: 'scroll', symbol: 'cSLP', expected: true }, // regex /(cSLP|sSLP)$/
      { chain: 'scroll', symbol: 'sSLP', expected: true }, // regex /(cSLP|sSLP)$/
      { chain: 'btn', symbol: 'SOME-XLT', expected: true }, // regex /(XLT)$/
      { chain: 'fantom', symbol: 'NLT', expected: true },
      { chain: 'nova', symbol: 'NLT', expected: true },
      { chain: 'ethereumclassic', symbol: 'ETCMC-V2', expected: true },
      { chain: 'shibarium', symbol: 'SSLP', expected: true },
      { chain: 'shibarium', symbol: 'ChewyLP', expected: true },
      { chain: 'omax', symbol: 'OSWAP-V2', expected: true },
      { chain: 'sonic', symbol: 'TOKEN spLP', expected: true }, // endsWith(' spLP')
    ];

    cases.forEach(({ chain, symbol, expected }) => {
      assert.strictEqual(isLP(symbol, '0x123', chain), expected, `Expected ${symbol} on ${chain} to be ${expected}`);
    });
  });

  it('should handle chain-specific exclusions correctly', () => {
    const cases = [
      { chain: 'polygon', symbol: 'DLP', expected: false },
      { chain: 'ethereum', symbol: 'SUDO-LP', expected: false },
      { chain: 'ethereum', symbol: 'ANY-LP-f', expected: false }, // endsWith('LP-f')
      { chain: 'arbitrum', symbol: 'DLP-TOKEN', expected: false }, // regex /^(DLP|LP-)/
      { chain: 'arbitrum', symbol: 'LP-TOKEN', expected: false }, // regex /^(DLP|LP-)/
      { chain: 'bsc', symbol: 'ANY-APE-LP-S', expected: false }, // regex /(-APE-LP-S)/
    ];

    cases.forEach(({ chain, symbol, expected }) => {
      assert.strictEqual(isLP(symbol, '0x123', chain), expected, `Expected ${symbol} on ${chain} to be ${expected}`);
    });
  });

  it('should return false for blacklisted labels', () => {
    // These trigger logging, which we can ignore for now or mock if we want to be strict
    // Blacklisting logic:
    // symbol.startsWith('ZLK-LP') || symbol.includes('DMM-LP') || (chain === 'avax' && 'DLP' === symbol) || symbol === 'fChe-LP'

    assert.strictEqual(isLP('ZLK-LP-Token', '0x123', 'ethereum'), false);
    assert.strictEqual(isLP('Some-DMM-LP-Token', '0x123', 'ethereum'), false);
    assert.strictEqual(isLP('DLP', '0x123', 'avax'), false);
    assert.strictEqual(isLP('fChe-LP', '0x123', 'ethereum'), false);
  });

  it('should return true for general LP symbols and patterns', () => {
    // LP_SYMBOLS
    const lpSymbols = ['SLP', 'spLP', 'JLP', 'OLP', 'SCLP', 'DLP', 'MLP', 'MSLP', 'ULP', 'TLP', 'HMDX', 'YLP', 'SCNRLP', 'PGL', 'GREEN-V2', 'PNDA-V2', 'vTAROT', 'vEvolve', 'TETHYSLP', 'BAO-V2', 'DINO-V2', 'DFYNLP', 'LavaSwap', 'RLP', 'ZDEXLP', 'lawSWAPLP', 'ELP', 'ICELP', 'LFG_LP', 'KoffeeMug'];

    // Note: Some of these might be excluded on specific chains (e.g. OLP on bsc), but general case should pass on 'ethereum' for example
    lpSymbols.forEach(symbol => {
      // OLP is excluded on BSC, so let's test on ethereum
      // DLP is excluded on BSC, polygon, avax(blacklist label), arbitrum(prefix)
      // MLP is excluded on BSC
      // LP is excluded on BSC
      // LFG_LP is explicitly included on ethpow, but should also pass general check

      let chain = 'ethereum';
      if (['DLP', 'OLP', 'MLP', 'LP'].includes(symbol)) {
         // These might be tricky if we don't pick the right chain, but 'ethereum' doesn't exclude them except specific ones
         // 'DLP' is excluded on polygon and arbitrum and avax (blacklist). On ethereum it should be fine?
         // Let's check code:
         // if (chain === 'polygon' && ['DLP'].includes(symbol)) return false
         // if (chain === 'arbitrum' && /^(DLP|LP-)/.test(symbol)) return false
         // if (chain === 'avax' && 'DLP' === symbol) -> blacklist
         // chain === 'bsc' && ['OLP', 'DLP', 'MLP', 'LP', ...].includes(symbol) -> false
      }

      // Let's just run it on 'optimism' or generic chain unless it has specific rules
      assert.strictEqual(isLP(symbol, '0x123', 'optimism'), true, `Expected ${symbol} to be true generally`);
    });

    // Regex matches: /(UNI-V2|vAMM|sAMM)/
    assert.strictEqual(isLP('UNI-V2-LP', '0x123', 'ethereum'), true);
    assert.strictEqual(isLP('Token-vAMM-Token', '0x123', 'ethereum'), true);
    assert.strictEqual(isLP('sAMM-Token', '0x123', 'ethereum'), true);

    // 'LP' in symbol split by non-word chars
    assert.strictEqual(isLP('SushiSwap LP', '0x123', 'ethereum'), true);
    assert.strictEqual(isLP('Token/LP', '0x123', 'ethereum'), true);
    assert.strictEqual(isLP('MyToken-LP', '0x123', 'ethereum'), true);
  });

  it('should return false for symbols not looking like LPs', () => {
    assert.strictEqual(isLP('USDC', '0x123', 'ethereum'), false);
    assert.strictEqual(isLP('WETH', '0x123', 'ethereum'), false);
    assert.strictEqual(isLP('WBTC', '0x123', 'ethereum'), false);
    assert.strictEqual(isLP('DAI', '0x123', 'ethereum'), false);
  });
});
