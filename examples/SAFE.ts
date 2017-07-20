#!/usr/bin/env node

// http://choly.ca/post/typescript-json/ may be relevant one day

let cftemplate = require('../')
var fs = require('fs')
var glob = require('glob')
var path = require('path')

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

function nonzero(input: string): boolean {
    return (Number(input) > 0);
}

function read(file) {
    return fs.readFileSync(file).toString()
}

export function controller(userJSON) {
    let [controlJSON, guessedSpecies] = guessSpecies(userJSON);
    let [validationError, validation_rv] = validate(guessedSpecies, controlJSON, userJSON); // should be either a Cap, Discount, CapDiscount, or MFN -- can typescript do that?
    if (validationError) {
        console.log("VALIDATION ERROR: " + validation_rv);
    }
    else {
        // turn the cftemplate into a commonform

        var mergedJSON = {};
        Object.assign(mergedJSON, userJSON, controlJSON);

        console.log("running cftemplate now! wish me luck!");

        cftemplate(read('SAFE.cftemplate'),
            ".",
            mergedJSON);

        // render the commonform into output
    }
}

function guessSpecies(userJSON: Common): [controlJSON, Species] {
    let controlJSON: controlJSON = {
        cap: false,
        discount: false
    };
    let species: Species;

    if (userJSON.hasOwnProperty("Discount Rate")
        && undefined != userJSON["Discount Rate"]
        && nonzero(userJSON["Discount Rate"])) { controlJSON.discount = true }
    if (userJSON.hasOwnProperty("Valuation Cap")
        && undefined != userJSON["Valuation Cap"]
        && nonzero(userJSON["Valuation Cap"])) { controlJSON.cap = true }

    if (controlJSON.discount && controlJSON.cap) { species = Species.CapDiscount }
    else if (controlJSON.discount) { species = Species.Discount }
    else if (controlJSON.cap) { species = Species.Cap }
    else { species = Species.MFN }

    return [controlJSON, species]
}

function validate(species, controljson, userjson): [boolean, string] {
    // does typescript approve of the JSON object?
    // or should we be using http://json-schema.org/
    return [false, "this is fine."];
}

import stdio = require("stdio");
let opt = stdio.getopt();
console.log("moo");

let userjson = read("SAFE.user.json");

controller(userjson);
