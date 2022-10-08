const chainTypeExports = (chainType, chainFn, chains) => {
  const chainTypeProps = chains.reduce(
    (obj, chain) => ({
      ...obj,
      [chain === "avax" ? "avalanche" : chain]: {
        [chainType]: chainFn(chain),
      },
    }),
    {}
  );

  return chainTypeProps;
};

const chainJoinExports = (cExports, chains) => {
  const createdCExports = cExports.map((cExport) => cExport(chains));
  const chainJoins = chains.reduce((obj, chain) => {
    chain = chain === "avax" ? "avalanche" : chain;

    return {
      ...obj,
      [chain]: Object.fromEntries(
        createdCExports.flatMap((cExport) => [
          ...Object.entries(cExport[chain]),
        ])
      ),
    };
  }, {});

  return chainJoins;
};

module.exports = {
  chainTypeExports,
  chainJoinExports,
};
