const { sumTokens2 } = require('../helper/unwrapLPs');

// عناوين العقود الفعلية
const EVM_OWNERS = [
  "0xf3e726642f6384cb3d0ca14f426403bae888bf96",
  "0x2e8601bfb4bd0f31a60e1b93945cfb7d6c2f17c5",
  // ... ضع بقية العناوين الـ 21 هنا
];

const SOLANA_OWNERS = [
  "Eq9MkY3jhFsjGQ4RjUjrFjGUD34qyN2iBhqFLzZEDydQ",
  "EZqGfTKusnWaZoFqfKqZbwwcM9oZFE5tuc2EpuseFKkk"
];

async function tvl(api) {
  const chain = api.chain;
  if (chain === 'solana') {
    return sumTokens2({ chain: 'solana', owners: SOLANA_OWNERS });
  }
  return sumTokens2({ api, owners: EVM_OWNERS });
}

async function fees(api) {
  // استخدم العنوان الحقيقي لجامع الرسوم
  const feeCollector = '0x...'; // ضع العنوان الصحيح هنا
  const feeToken = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'; // USDC
  const balance = await api.call({
    target: feeCollector,
    abi: 'erc20:balanceOf',
    params: [feeCollector]
  });
  return { [feeToken]: balance };
}

async function volume(api) {
  // مثال: حساب الحجم من أحداث العقود (استبدل بمنطقك الفعلي)
  // يمكنك استخدام api.getLogs() لتتبع أحداث معينة
  return {};
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: "TVL: Sum of native and synthetic tokens across clusters. Fees: Collected protocol fees from intent execution. Volume: Total value of intents executed.",
  ethereum: { tvl, fees, volume },
  arbitrum: { tvl, fees, volume },
  optimism: { tvl, fees, volume },
  polygon: { tvl, fees, volume },
  bsc: { tvl, fees, volume },
  base: { tvl, fees, volume },
  solana: { tvl, fees, volume }
};
