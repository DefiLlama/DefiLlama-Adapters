const ADDRESSES = require('../helper/coreAssets.json');

process.env.HSK_RPC = 'https://mainnet.hsk.xyz';

const PRICE_CONTRACT = "0x5d6C18a0f9E63B48a556394a6429dc5b035c9ec0";
const SUPPLY_CONTRACT = "0x5ABBCb1e99076ab0093d0Ad888cB140d5d5cB556";
const TOKEN_ID = 1000;

async function tvl(api) {
  const price = await api.call({
    target: PRICE_CONTRACT,
    params: [TOKEN_ID],
    abi: 'function getLatestPrice(uint256 tokenId) view returns (uint256)'
  });

  const supply = await api.call({
    target: SUPPLY_CONTRACT,
    params: [TOKEN_ID],
    abi: 'function totalSupply(uint256 tokenId) view returns (uint256)'
  });

  const tvlValue = BigInt(price) * BigInt(supply);
  
  api.add(ADDRESSES.hsk.USDT, tvlValue.toString());
}

module.exports = {
  methodology: "TVL calculated by multiplying latest price from getLatestPrice(1000) by total supply from totalSupply(1000)",
  hsk: {
    tvl
  }
};