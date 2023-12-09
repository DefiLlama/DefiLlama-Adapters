import { Liq } from "../utils/types";
import axios from "axios";

const liquidations = async () => {
    const info = await axios.get("https://api-defi.naviprotocol.io/estimateLiquidateUser");

    return info.data.map(
        ({ owner, liqPrice, collateral, collateralAmount }) =>
        ({
            owner,
            liqPrice,
            collateral,
            collateralAmount,
        } as Liq)
    );
};

module.exports = {
    sui: {
        liquidations,
    },
};
