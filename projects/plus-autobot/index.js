const { fetchURL } = require("../helper/utils");

async function fetch() {
  const response = await fetchURL("https://bot.plusmain.net/api/defillama/tvl");
  // axios의 response 구조에 맞게 데이터를 추출하여 리턴합니다.
  return response.data.tvl;
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: "TVL includes Base Genesis Node Staking, Ecosystem Treasury Live User Deposits managed off-chain.",
  // API를 통해 통합 TVL 단순 숫자를 가져올 때는 루트 레벨에 fetch를 위치시켜야 합니다.
  fetch: fetch
};
