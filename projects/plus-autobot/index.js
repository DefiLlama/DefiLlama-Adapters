const { fetchURL } = require("../helper/utils");

async function fetch() {
  const response = await fetchURL("https://bot.plusmain.net/api/defillama/tvl");
  
  // 핵심 포인트: 단순 숫자가 아닌, tether(USDT 단위) 객체 형태로 반환해야 봇이 인식합니다!
  return { 
    tether: response.data.tvl 
  };
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: "TVL includes Base Genesis Node Staking, Ecosystem Treasury Live User Deposits managed off-chain.",
  plus: {
    tvl: fetch
  }
};
