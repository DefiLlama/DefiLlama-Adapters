const { get } = require('../helper/http');

async function tvl() {
  try {
    const data = await get('https://analytics.liquidium.wtf/');
    
    // Initialize balances object
    const balances = {};
    
    // Separate data by collateral type
    const collateralTypes = {
      inscription: [],
      brc20: [],
      other: []
    };
    
    // Group data by collateral type
    data.forEach(entry => {
      const collateralType = entry.collateral_type?.toLowerCase();
      if (collateralType === 'inscription') {
        collateralTypes.inscription.push(entry);
      } else if (collateralType === 'brc20') {
        collateralTypes.brc20.push(entry);
      } else {
        collateralTypes.other.push(entry);
      }
    });
    
    // Calculate total TVL across all collateral types
    let totalTvlBtc = 0;
    data.forEach(entry => {
      if (entry.tvl_btc && entry.tvl_btc > 0) {
        totalTvlBtc += entry.tvl_btc;
      }
    });
    
    // Return Bitcoin TVL using coingecko identifier
    if (totalTvlBtc > 0) {
      balances['coingecko:bitcoin'] = totalTvlBtc;
    }
    
    return balances;
  } catch (error) {
    console.error('Error fetching Liquidium TVL:', error);
    throw error;
  }
}

// Enhanced function to get detailed breakdown (for logging/debugging)
async function getDetailedBreakdown() {
  try {
    const data = await get('https://analytics.liquidium.wtf/');
    
    const breakdown = {
      total: {
        tvl_btc: 0,
        tvl_usd: 0,
        volume_24h_usd: 0,
        revenue_24h_usd: 0,
        interest_paid_24h_usd: 0
      },
      by_collateral_type: {},
      by_token: {},
      token_count: 0,
      active_tokens: 0
    };
    
    data.forEach(entry => {
      const collateralType = entry.collateral_type || 'Unknown';
      const slug = entry.slug || 'aggregate';
      
      // Aggregate totals
      breakdown.total.tvl_btc += entry.tvl_btc || 0;
      breakdown.total.tvl_usd += entry.tvl_usd || 0;
      breakdown.total.volume_24h_usd += entry.volume_24h_usd || 0;
      breakdown.total.revenue_24h_usd += entry.revenue_24h_usd || 0;
      breakdown.total.interest_paid_24h_usd += entry.interest_paid_24h_usd || 0;
      
      // Group by collateral type
      if (!breakdown.by_collateral_type[collateralType]) {
        breakdown.by_collateral_type[collateralType] = {
          tvl_btc: 0,
          tvl_usd: 0,
          volume_24h_usd: 0,
          revenue_24h_usd: 0,
          interest_paid_24h_usd: 0,
          token_count: 0
        };
      }
      
      breakdown.by_collateral_type[collateralType].tvl_btc += entry.tvl_btc || 0;
      breakdown.by_collateral_type[collateralType].tvl_usd += entry.tvl_usd || 0;
      breakdown.by_collateral_type[collateralType].volume_24h_usd += entry.volume_24h_usd || 0;
      breakdown.by_collateral_type[collateralType].revenue_24h_usd += entry.revenue_24h_usd || 0;
      breakdown.by_collateral_type[collateralType].interest_paid_24h_usd += entry.interest_paid_24h_usd || 0;
      breakdown.by_collateral_type[collateralType].token_count += 1;
      
      // Group by token
      if (slug && slug !== '') {
        breakdown.by_token[slug] = {
          collateral_type: collateralType,
          tvl_btc: entry.tvl_btc || 0,
          tvl_usd: entry.tvl_usd || 0,
          volume_24h_usd: entry.volume_24h_usd || 0,
          volume_all_time_usd: entry.volume_all_time_usd || 0,
          revenue_24h_usd: entry.revenue_24h_usd || 0,
          revenue_all_time_usd: entry.revenue_all_time_usd || 0,
          interest_paid_24h_usd: entry.interest_paid_24h_usd || 0,
          interest_paid_all_time_usd: entry.interest_paid_all_time_usd || 0
        };
        breakdown.active_tokens += (entry.tvl_usd > 0) ? 1 : 0;
      }
      
      breakdown.token_count += 1;
    });
    
    return breakdown;
  } catch (error) {
    console.error('Error fetching detailed breakdown:', error);
    return null;
  }
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: `
    TVL represents the total value of Bitcoin locked in Liquidium lending pools across all collateral types.
    
    LIQUIDIUM PROTOCOL BREAKDOWN:
    • Inscription Tokens: Bitcoin Ordinals/Inscriptions used as collateral
    • BRC-20 Tokens: Bitcoin-based BRC-20 tokens used as collateral
    • Volume: 24h lending activity across all token types
    • Revenue: Protocol fees and interest earned
    • Interest Paid: Rewards distributed to lenders
    
    Data is sourced directly from Liquidium's comprehensive API which tracks:
    - TVL by collateral type and individual token
    - Volume metrics (24h, 7d, 30d, all-time)
    - Revenue and fee generation
    - Interest payments to lenders
    - Individual token performance and activity
  `,
  hallmarks: [
    [Math.floor(Date.now() / 1000), "Liquidium Bitcoin Lending Protocol Launch"],
  ],
  bitcoin: {
    tvl,
  },
}; 
