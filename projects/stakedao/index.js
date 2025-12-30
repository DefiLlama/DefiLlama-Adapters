const { sumTokens2 } = require("../helper/unwrapLPs");
const { getConfig } = require("../helper/cache");

const lockers = require("./lockers");
const { ABI, STRATEGIES_ENDPOINT, LOCKERS_ENDPOINT, LEGACY_VAULTS, LOCKERS, LOCKERS_GATEWAY } = require("./utils");

// ********************************************************************************
// ********                                                                ********
// ********                        LEGACY PRODUCTS                         ********
// ********                                                                ********
// ********************************************************************************

async function handleLegacyProducts(api) {
  await api.erc4626Sum({ calls: LEGACY_VAULTS[api.chainId] });
}

// ********************************************************************************
// ********                                                                ********
// ********                          STRATEGIES                            ********
// ********                                                                ********
// ********************************************************************************

async function handleStrategies(api, holder, underlying, strats, onlyboost, blacklistTokens = []) {
  const calls = [];
  const tokens = [];

  const llamalend = [];
  const yearn = [];

  const blacklist = new Set(blacklistTokens.map((t) => t.toLowerCase()));

  for (let i = 0; i < strats.length; ++i) {
    const strat = strats[i];
    const lpTokenAddress = strat.lpToken.address;
    const lpTokenAddressLC = lpTokenAddress.toLowerCase();

    if (blacklist.has(lpTokenAddressLC))
      continue;

    if (strat.isLending) {
      llamalend.push({
        token: { target: strat.lpToken.address },
        balance: { target: strat.gaugeAddress, params: holder },
      });
    } else if (strat.protocol === "yearn") {
      yearn.push({
        token: strat.underlyingReward[0].address,
        vault: { target: strat.lpToken.address },
        balance: { target: strat.gaugeAddress, params: holder },
      });
    } else if (strat.protocol === "curve" && strat.version !== 2) {
      tokens.push(lpTokenAddress);
      calls.push({ target: lpTokenAddress, params: strat.vault });
    } else {
      const token = lpTokenAddress;
      const receipt = underlying === "pendle" ? lpTokenAddress : strat.gaugeAddress;

      tokens.push(token);
      calls.push({ target: receipt, params: holder });

      if (onlyboost) {
        const receipt = strat[onlyboost.poolKey]?.crvRewards;
        const holder = strat.onlyboost?.implementations?.find(
          (os) => os.key === onlyboost.key
        )?.address;

        if (holder && receipt) {
          tokens.push(token);
          calls.push({ target: receipt, params: holder });
        }
      }
    }
  }

  if (llamalend.length > 0) {
    const llBalance = await api.multiCall({ abi: "erc20:balanceOf", calls: llamalend.map((el) => el.balance) });
    const llTokens = await api.multiCall({ abi: "function borrowed_token() public view returns (address)", calls: llamalend.map((el) => el.token) });
    const llPricePerShare = await api.multiCall({ abi: ABI.pricePerShare, calls: llamalend.map((el) => el.token) });

    for (let i = 0; i < llamalend.length; ++i) {
      const tokenBalance = (llBalance[i] * llPricePerShare[i]) / 1e18;
      api.add(llTokens[i], tokenBalance);
    }
  }

  if (yearn.length > 0) {
    const yearnBalance = await api.multiCall({ abi: "erc20:balanceOf", calls: yearn.map((el) => el.balance) });
    const yearnPricePerShare = await api.multiCall({ abi: ABI.pricePerShare, calls: yearn.map((el) => el.vault) });

    for (let i = 0; i < yearn.length; ++i) {
      const tokenBalance = (yearnBalance[i] * yearnPricePerShare[i]) / 1e18;
      api.add(yearn[i].token, tokenBalance);
    }
  }

  if (calls.length > 0) {
    const balances = await api.multiCall({ abi: "erc20:balanceOf", calls });
    api.addTokens(tokens, balances);
  }
}

async function getV1Strategies(api, underlying, onlyboost, blacklistTokens = []) {
  const res = await getConfig(
    `stakedao/${api.chainId}-${underlying}`,
    `${STRATEGIES_ENDPOINT}/${underlying}/${api.chainId}.json`
  );

  await handleStrategies(api, LOCKERS[underlying][api.chainId], underlying, res.deployed, onlyboost, blacklistTokens);
}

async function getV2Strategies(api, underlying, onlyboost, blacklistTokens = []) {
  const res = await getConfig(
    `stakedao/${api.chainId}-v2-${underlying}`,
    `${STRATEGIES_ENDPOINT}/v2/${underlying}/${api.chainId}.json`
  );

  await handleStrategies(api, LOCKERS_GATEWAY[underlying][api.chainId], underlying, res, onlyboost, blacklistTokens);
}

// ********************************************************************************
// ********                                                                ********
// ********                            LOCKERS                             ********
// ********                                                                ********
// ********************************************************************************

async function handleLockers(api) {
  const res = await getConfig(
    `stakedao/${api.chainId}-lockers`,
    `${LOCKERS_ENDPOINT}/`
  ).then((res) => res.parsed);

  const promises = [lockers.common(api, res)];

  if (api.chainId === 1) {
    promises.push(
      ...[
        lockers.pendle(api, res),
        lockers.yieldnest(api, res),
        lockers.maverick(api, res),
        lockers.frax(api, res),
      ]
    );
  } else if (api.chainId === 252) {
    promises.push(lockers.frax(api, res));
  } else if (api.chainId === 8453) {
    promises.push(lockers.spectra(api, res));
  } else if (api.chainId === 59144) {
    promises.push(lockers.zero(api, res));
  }

  await Promise.all(promises);
}

// ********************************************************************************
// ********                                                                ********
// ********                              TVL                               ********
// ********                                                                ********
// ********************************************************************************

async function ethereum(api) {
  const blacklist = ["0x98b540fa89690969D111D045afCa575C91519B1A"];
  await Promise.all([
    // Lockers
    handleLockers(api),
    // Strategies v1
    getV1Strategies(api, "curve", { key: "convex", poolKey: "convexPool" }, blacklist),
    getV1Strategies(api, "balancer"),
    getV1Strategies(api, "pendle"),
    getV1Strategies(api, "yearn"),
    // Strategies v2
    getV2Strategies(api, "curve", { key: "convex", poolKey: "convexPool" }, blacklist),
  ]);

  return sumTokens2({ api, resolveLP: true });
}

async function arbitrum(api) {
  await Promise.all([
    // Strategies v1
    getV1Strategies(api, "curve"),
    // Strategies v2
    getV2Strategies(api, "curve", { key: "convex", poolKey: "convexPool" }),
  ]);

  return sumTokens2({ api, resolveLP: true });
}

async function fraxtal(api) {
  await Promise.all([
    // Lockers
    handleLockers(api),
    // Strategies v2
    getV2Strategies(api, "curve", { key: "convex", poolKey: "convexPool" }),
  ]);

  return sumTokens2({ api, resolveLP: true });
}

async function sonic(api) {
  await Promise.all([
    // Strategies v2
    getV2Strategies(api, "curve"),
  ]);

  return sumTokens2({ api, resolveLP: true });
}

async function base(api) {
  await Promise.all([
    // Lockers
    handleLockers(api),
    // Strategies v2
    getV2Strategies(api, "curve"),
  ]);

  return sumTokens2({ api, resolveLP: true });
}

async function xdai(api) {
  await Promise.all([
    // Strategies v2
    getV2Strategies(api, "curve"),
  ]);

  return sumTokens2({ api, resolveLP: true });
}

async function optimism(api) {
  await Promise.all([
    // Strategies v2
    getV2Strategies(api, "curve"),
  ]);

  return sumTokens2({ api, resolveLP: true });
}

async function polygon(api) {
  await Promise.all([
    // Legacy Products
    handleLegacyProducts(api),
  ]);

  return sumTokens2({ api, resolveLP: true });
}

async function avax(api) {
  await Promise.all([
    // Legacy Products
    handleLegacyProducts(api),
  ]);

  return sumTokens2({ api, resolveLP: true });
}

async function linea(api) {
  await Promise.all([
    // Lockers
    handleLockers(api),
  ]);

  return sumTokens2({ api, resolveLP: true });
}

async function staking(api) {
  const sanctuary = "0xaC14864ce5A98aF3248Ffbf549441b04421247D3";
  const arbStrat = "0x20D1b558Ef44a6e23D9BF4bf8Db1653626e642c3";
  const veSdt = "0x0C30476f66034E11782938DF8e4384970B6c9e8a";
  const sdtToken = "0x73968b9a57c6E53d41345FD57a6E6ae27d6CDB2F";

  return sumTokens2({
    api,
    owners: [sanctuary, arbStrat, veSdt],
    tokens: [sdtToken],
  });
}

module.exports = {
  misrepresentedTokens: true,
  ethereum: { tvl: ethereum, staking },
  optimism: { tvl: optimism },
  polygon: { tvl: polygon },
  avax: { tvl: avax },
  arbitrum: { tvl: arbitrum },
  sonic: { tvl: sonic },
  fraxtal: { tvl: fraxtal },
  base: { tvl: base },
  xdai: { tvl: xdai },
  linea: { tvl: linea },
};
