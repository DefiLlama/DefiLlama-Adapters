function inferProtocol(protocol, name) {
    let inferredProtocol = "Unsupported protocol";
    
    switch (protocol) {
        case "Berachain":
            if (name.includes("BeraSwap")) {
                inferredProtocol = "BeraSwap";
            }
            break;
        case "Bullas":
            inferredProtocol = "Bullas";
            break;
        case "Gumball":
            inferredProtocol = "Gumball";
            break;
        case "BGT Station":
        case "Infrared":
            if (name.includes("Berps")) {
                inferredProtocol = "BERPS";
            }
            if (name.includes("BeraSwap")) {
                inferredProtocol = "BeraSwap";
            }
            if (name.includes("Kodiak")) {
                inferredProtocol = "Kodiak";
            }
            break;
        case "Infrared Trifecta":
            if (name.includes("Island")) {
                inferredProtocol = "Infrared Trifecta Kodiak";
            }
            break;
        case "Kodiak":
            return "Kodiak";
        case "Kodiak Trifecta":
            return "Kodiak Trifecta";
        case "BeraPaw":
            if (name.includes("BeraSwap")) {
                inferredProtocol = "BeraSwap";
            }
            if (name.includes("Beraborrow")) {
                inferredProtocol = "Beraborrow";
            }
            break;
        case "Liquidity Trifecta":
            if (name.includes("Kodiak Island")) {
                inferredProtocol = "Kodiak Trifecta";
            }
            break;
        case "Beradrome":
            if (name.includes("Kodiak") && name.includes("V2")) {
                inferredProtocol = "Kodiak V2";
            }
            break;
        default:
            break;
    }
    
    return inferredProtocol;
}

module.exports = {
    inferProtocol
}