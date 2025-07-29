const ADDRESSES = require('../helper/coreAssets.json');

const MASTER_CHEF = '0x3f9458892fB114328Bc675E11e71ff10C847F93b';
const LAND_TOKEN = '0xA73164DB271931CF952cBaEfF9E8F5817b42fA5C';
const LAND_BNB_LP = '0x13F80c53b837622e899E1ac0021ED3D1775CAeFA';
const USDT = ADDRESSES.bsc.USDT; // Use standard USDT address
const LSRWA_USDT_LP = '0x89bad177367736C186F7b41a9fba7b23474A1b35';
const API_CONSUMER = '0x61f8c9fE835e4CA722Db3A81a2746260b0D77735';
const WBNB = ADDRESSES.bsc.WBNB; // Use standard WBNB address

module.exports = {
  timetravel: false,
  misrepresentedTokens: false,
  methodology: 'TVL includes LAND-BNB LP in MasterChef, staked LAND, RWA value, and LSRWA-USDT LP balance.',
  bsc: {
    tvl: async (api) => {
      try {
        // 1. LAND-BNB LP in MasterChef (PID 1) - get WBNB amount and multiply by 2
        const [bnbInLP, totalLPSupply, lpStakedAmount] = await Promise.all([
          api.call({ abi: 'erc20:balanceOf', target: WBNB, params: [LAND_BNB_LP] }),
          api.call({ abi: 'erc20:totalSupply', target: LAND_BNB_LP }),
          // Get total LP tokens held by MasterChef (all staked LP tokens)
          api.call({ abi: 'erc20:balanceOf', target: LAND_BNB_LP, params: [MASTER_CHEF] })
        ]);
        
        console.log(`LP Staked Amount: ${lpStakedAmount}`);
        console.log(`Total LP Supply: ${totalLPSupply}`);
        console.log(`BNB in LP: ${bnbInLP}`);
        
        if (Number(lpStakedAmount) > 0) {
          // Calculate staked LP ratio and get BNB portion
          const lpRatio = Number(lpStakedAmount) / Number(totalLPSupply);
          const stakedBnbInLP = Number(bnbInLP) * lpRatio;
          
          console.log(`LP Ratio: ${lpRatio}`);
          console.log(`BNB in staked LP: ${stakedBnbInLP}`);
          console.log(`LP Value (BNB * 2): ${stakedBnbInLP * 2}`);
          
          // Add BNB amount * 2 to represent full LP value (will show as WBNB in output)
          api.add(WBNB, stakedBnbInLP * 2);
        }

        // 2. LAND token staked - use totalStaked() function from MasterChef
        const totalLandStaked = await api.call({
          abi: 'function totalStaked() view returns (uint256)',
          target: MASTER_CHEF
        });
        
        console.log(`Total LAND staked: ${totalLandStaked}`);
        if (Number(totalLandStaked) > 0) {
          api.add(LAND_TOKEN, totalLandStaked);
        }

        // 3. RWA value - from getTotalValue() converted via formatEther
        const rwaValue = await api.call({
          abi: 'function getTotalValue() view returns (uint256)',
          target: API_CONSUMER
        });
        
        console.log(`RWA Value: ${rwaValue}`);
        if (Number(rwaValue) > 0) {
          api.addUSDValue(Number(rwaValue) / 1e18);
        }

        // 4. LSRWA-USDT LP - add the LP token itself, not just USDT balance
        const lsrwaUsdtLPBalance = await api.call({
          abi: 'erc20:balanceOf',
          target: LSRWA_USDT_LP,
          params: [MASTER_CHEF] // Or wherever it's staked
        });
        
        console.log(`LSRWA-USDT LP Balance: ${lsrwaUsdtLPBalance}`);
        if (Number(lsrwaUsdtLPBalance) > 0) {
          api.add(LSRWA_USDT_LP, lsrwaUsdtLPBalance);
        }

        return api.getBalances();

      } catch (error) {
        console.error('Error in TVL calculation:', error);
        throw error;
      }
    },
  },
};