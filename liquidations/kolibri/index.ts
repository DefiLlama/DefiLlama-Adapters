import { CONTRACTS, HarbingerClient } from "@hover-labs/kolibri-js";
import { OVEN_DATA_BASE_URL, TEZOS_RPC, getOvens, mapOven } from "./utils";

import { Liq } from "../utils/types";

const harbingerClient = new HarbingerClient(
  TEZOS_RPC,
  CONTRACTS.MAIN.HARBINGER_NORMALIZER
);

const positions = async (): Promise<Liq[]> => {
  const [ovens, { price }] = await Promise.all([
    getOvens(OVEN_DATA_BASE_URL),
    harbingerClient.getPriceData(),
  ]);

  return Promise.all(ovens.map((oven) => mapOven(oven, price)));
};

module.exports = {
  tezos: {
    liquidations: positions,
  },
};
