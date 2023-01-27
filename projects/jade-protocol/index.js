const { sumTokensExport, nullAddress, } = require('../helper/unwrapLPs')

   const config = {
     ethereum: {
       owners: [
         '0x6f0bc6217faa5a2f503c057ee6964b756a09ae2c',
         '0xcb0718b150552af8904e7cb1c62758dcb149b072',
       ],
       tokens: ['0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', nullAddress, // USDC
                '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', // wbtc
                '0xac3E018457B222d93114458476f3E3416Abbe38F', // sfrxETH
                '0x3432B6A60D23Ca0dFCa7761B7ab56459D9C964D0', // FXS
             ] 
     },
     arbitrum: {
       owners: ['0x02944e3fb72aa13095d7cebd8389fc74bec8e48e',
                '0xd012A9C8159b0E7325448eD30B1499FddDAc0F40',
               ],
       tokens: ['0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8', nullAddress, // USDC
                '0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a', // GMC
                '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1', // DAI
               ]  
     },
     optimism: {
        owners: ['0x489f866c0698C8D6879f5C0F527bc8281046042D'], 
        tokens: ['0x7F5c764cBc14f9669B88837ca1490cCa17c31607', nullAddress, ] // USDC
     },
     avax: {
        owners: ['0xaeA6B4AAd5e315a40aFD77a1F794F61161499Fa5'], 
        tokens: ['0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E', nullAddress], // USDC
     },
     bsc: {
        owners: ['0x169169a50d9a8fbf99edacf9aa10297e2b3c92dd'],
        tokens: ['0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56'], // BUSD
     }
   }
   
   module.exports = {
   };
   
   Object.keys(config).forEach(chain => {
     const { owners, tokens } = config[chain]
     module.exports[chain] = {
       treasury: sumTokensExport({owners, tokens }),
       tvl: () => ({})
     }
   })