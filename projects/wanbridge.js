const ADDRESSES = require('./helper/coreAssets.json')
const { get } = require("./helper/http");
const { sumTokens } = require('./helper/sumTokens');
const { sumTokens2 } = require('./helper/unwrapLPs');
const sdk = require('@defillama/sdk');

let ret;
async function getLockAddress() {
  // This is an api which could get wanchain bridge's lockAddress, balance, tvl and price;
  // The information is updated every 1 hour.
  if (!ret) {
    ret = await get("https://bridge-api.wanchain.org/api/tvl");
  }
  return ret.data.address;
}

const chainsMap = {
  bitcoin: "btc",
  litecoin: "ltc",
  ripple: "xrp",
};

const lockAddress = {
  bitcoin: "",
  doge: "",
  litecoin: "",
  ripple: "",
  noble: "",
  cardano: "addr1xyw0kswupwx38ljnvq8pwpvae0x69krywdr7cffg3d84ydp9nvv84g58ykxqh90xx6j8ywgjst0dkt430w9lxgdmzncsw5rzpd",
  wan: "0xe85b0d89cbc670733d6a40a9450d8788be13da47",
  ethereum: "0xfceaaaeb8d564a9d0e71ef36f027b9d162bc334e",
  bsc: "0xc3711bdbe7e3063bf6c22e7fed42f782ac82baee",
  avax: "0x74e121a34a66d54c33f3291f2cdf26b1cd037c3a",
  moonriver: "0xde1ae3c465354f01189150f3836c7c15a1d6671d",
  moonbeam: "0x6372aec6263aa93eacedc994d38aa9117b6b95b5",
  polygon: "0x2216072a246a84f7b9ce0f1415dd239c9bf201ab",
  arbitrum: "0xf7ba155556e2cd4dfe3fe26e506a14d2f4b97613",
  fantom: "0xccffe9d337f3c1b16bd271d109e691246fd69ee3",
  optimism: "0xc6ae1db6c66d909f7bfeeeb24f9adb8620bf9dbf",
  xdc: "0xf7ba155556e2cd4dfe3fe26e506a14d2f4b97613",
  tron: "TZ9grqg3LwBKiddGra3WGHPdddJz3tow8N",
  okexchain: "0xf7ba155556e2cd4dfe3fe26e506a14d2f4b97613",
  // clover: "0xf7ba155556e2cd4dfe3fe26e506a14d2f4b97613",
  astar: "0x592de30bebff484b5a43a6e8e3ec1a814902e0b6",
  telos: "0x201e5de97dfc46aace142b2009332c524c9d8d82",
  functionx: "0xdf935552fac687123c642f589296762b632a9aaf",
  base: "0x2715aa7156634256ae75240c2c5543814660cd04",
  metis: "0xc6ae1db6c66d909f7bfeeeb24f9adb8620bf9dbf",
  celo: "0x14ca89ac9cd73b01bf71a3af3f8cf8fd224d6a1d",
  blast: "0xc21e5553c8dddf2e4a93e5bedbae436d4291f603",
  linea: "0xffb876bd5bee99e992cac826a04396002f5f4a65",
  op_bnb: "0xd6b24d0867753082e40778addb13e462a02689de",
  era: "0x102f0ce7a439d51247167d6233a0a44c3f8389a1",
  polygon_zkevm: "0xb13afe3e965dcd483022b1cc3adf03eea039a754",
  xlayer: "0xc21e5553c8dddf2e4a93e5bedbae436d4291f603",
  solana: "AKXdNCG4GcTQ1knC7kno9bggHuq8MG9CCb8yQd8Nx2vL",
  bitrock: "0xc21e5553c8dddf2e4a93e5bedbae436d4291f603",
  energi: "0xbe5187c2a7eb776c1caeed2c37e7599fb05000d3",
  odyssey: "0xc21e5553c8dddf2e4a93e5bedbae436d4291f603",
  songbird: "0xc21e5553c8dddf2e4a93e5bedbae436d4291f603",
};

Object.keys(lockAddress).map((chain) => {
  module.exports[chain] = {
    tvl: async (api) => {
      if (!lockAddress[chain]) {
        let ret = await getLockAddress();
        if (chainsMap[chain]) {
          lockAddress[chain] = ret[chainsMap[chain]];
        } else {
          lockAddress[chain] = ret[chain];
        }

        if (!lockAddress[chain]) {
          // console.log(`lockAddress[${chain}] is not found`);
          return {}
        }
      }
      
      // if chain is nonEVM, use sumTokens2
      const nonEVMChains = ['bitcoin', 'litecoin', 'doge', 'ripple', 'cardano', 'solana', 'tron'];
      const isEVMChain = !nonEVMChains.includes(chain);
      
      // skip problematic chains
      const problematicChains = ['clover', 'noble'];
      if (problematicChains.includes(chain)) {
        // console.log(`Skipping problematic chain: ${chain}`);
        return {};
      }
      
      if (isEVMChain) {
        // if chain is EVM, use sumTokens2
        // query native token
        const tokensAndOwners = [
          [ADDRESSES.null, lockAddress[chain]]
        ];
        
        // if chain has common tokens, add them
        if (ADDRESSES[chain]) {
          // add all tokens defined in coreAssets.json for this chain
          Object.entries(ADDRESSES[chain]).forEach(([symbol, address]) => {
            // Skip null address as it's already added
            if (symbol !== 'null' && address) {
              tokensAndOwners.push([address, lockAddress[chain]]);
            }
          });
          
          // add custom tokens
          if (chain === 'ethereum') {
            // add custom tokens
            const customEthereumTokens = [
              '0xAFCdd4f666c84Fed1d8BD825aA762e3714F652c9', // VINU
              '0xeb986DA994E4a118d5956b02d8b7c3C7CE373674', // GTH
              '0x97aeE01ed2aabAd9F54692f94461AE761D225f17', // DEGA
            ];
            customEthereumTokens.forEach(tokenAddress => {
              tokensAndOwners.push([tokenAddress, lockAddress[chain]]);
            });
          }

          if (chain === 'polygon') {
            const customPolygonTokens = [
              '0xAFCdd4f666c84Fed1d8BD825aA762e3714F652c9', // VINU
            ];
            customPolygonTokens.forEach(tokenAddress => {
              tokensAndOwners.push([tokenAddress, lockAddress[chain]]);
            });
          }

          if (chain === 'bsc') {
            const customBscTokens = [
              '0xeb986DA994E4a118d5956b02d8b7c3C7CE373674', // GTH
              '0xfEbe8C1eD424DbF688551D4E2267e7A53698F0aa', // VINU
            ];
            customBscTokens.forEach(tokenAddress => {
              tokensAndOwners.push([tokenAddress, lockAddress[chain]]);
            });
          }
        }
        
        // add permitFailure option, allow some token query failure
        return sumTokens2({
          api,
          tokensAndOwners,
          chain,
          resolveLP: true,
          permitFailure: true,
        });
      } else {
        // if chain is nonEVM, use sumTokens
        return sumTokens({
          api,
          chain,
          owners: [lockAddress[chain]],
        });
      }
    },
  };
});

module.exports.timetravel = false;
module.exports.misrepresentedTokens = true;
