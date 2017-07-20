
module.exports = controller;

// 4 Change of Control Voting Block Threshold
// 4 Company Legal Form
// 4 Company Name
// 2 Discount Rate
// 1 Equity Financing Purchase Price Threshold
// 4 Governing Law Jurisdiction
// 4 Investor Name
// 1 Liquidity Price Numerator
// 4 Purchase Amount
// 4 Purchase Date
// 4 Time Notice is Effective after Deposit in the Mail
// 2 Valuation Cap

// http://choly.ca/post/typescript-json/ may be relevant one day

interface Common {
    "Change of Control Voting Block Threshold": string, // percentage string, ends with %
    "Company Legal Form": string,
    "Company Name": string,
    "Governing Law Jurisdiction": string,
    "Investor Name": string,
    "Purchase Amount": string,
    "Purchase Date": string, // can we fromJSON this into a Date?
    "Time Notice is Effective after Deposit in the Mail": string
}

interface Cap extends Common { "Valuation Cap": string }
interface Discount extends Common { "Discount Rate": string }
interface CapDiscount extends Cap, Discount { }
interface MFN extends Common { "Equity Financing Purchase Price Threshold": string }

interface controlJSON { cap: boolean, discount: boolean }

enum Species { Cap, Discount, CapDiscount, MFN }

function nonzero(in : string): boolean {
    return (Number(in) > 0);
}

function controller(userJSON) {
    let guessedSpecies = guessSpecies(userJSON);
    let validate = validate(guessedSpecies, userJSON); // should be either a Cap, Discount, CapDiscount, or MFN -- can typescript do that?
}

function guessedSpecies(userJSON: Common) = {
    let controlJSON: controlJSON = {
        cap  = false,
        discount = false
    };
    let species: Species;

    if (userJSON.hasOwnProperty("Discount Rate")
        && undefined != userJSON["Discount Rate"]
        && nonzero(userJSON["Discount Rate"])) { controlJSON.discount = true }
    if (userJSON.hasOwnProperty("Valuation Cap")
        && undefined != userJSON["Valuation Cap"]
        && nonzero(userJSON["Valuation Cap"])) { controlJSON.cap = true }

    if (controlJSON.discount && controlJSON.cap) { species = CapDiscount }
    else if (controlJSON.discount) { species = Discount }
    else if (controlJSON.cap) { species = Cap }
    else { species = MFN }
}

function validate {
    // does typescript approve of the JSON object?
    // or should we be using http://json-schema.org/
}



