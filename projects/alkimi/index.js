const axios = require("axios");

const STAKING_VAULT = "0xc92fe84368fc3ff40713792c750709501fcfc4869f120755fd0bea5cac1ead94";
const ALKIMI_DECIMALS = 9n;
const ALKIMI_COINGECKO_ID = "alkimi-2";

module.exports = {
  timetravel: false,
  methodology: "Staking counts all ALKIMI tokens locked in the StakingVault (user + admin)",

  sui: {
    tvl: async () => 0,
    staking: async () => {
      // fetch vault data from Sui fullnode
      const resp = await axios.post("https://fullnode.mainnet.sui.io:443", {
        jsonrpc: "2.0",
        id: 1,
        method: "sui_getObject",
        params: [STAKING_VAULT, { showType: true, showOwner: true, showContent: true }],
      });

      const fields = resp.data.result?.data?.content?.fields;
      if (!fields) return {};

      const total = BigInt(fields.balance || "0");
      const humanTotal = Number(total / 10n ** ALKIMI_DECIMALS);

      // Optional: log user/admin breakdown for PR review
      const userLocked = BigInt(fields.user_locked || "0");
      const adminLocked = BigInt(fields.admin_locked || "0");
      console.log("=== ALKIMI Staking TVL ===");
      console.log("Total Tokens:", humanTotal);
      console.log("User Locked:", Number(userLocked / 10n ** ALKIMI_DECIMALS));
      console.log("Admin Locked:", Number(adminLocked / 10n ** ALKIMI_DECIMALS));
      console.log("========================");

      return {
        [ALKIMI_COINGECKO_ID]: humanTotal,
      };
    }
  }
};
