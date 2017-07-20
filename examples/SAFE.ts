#!/usr/bin/env node

// http://choly.ca/post/typescript-json/ may be relevant one day

const cftemplate = require('../index.js');
const fs = require('fs');
const glob = require('glob');
const path = require('path');
const stdio = require('stdio');

interface Common {    
    "Change of Control Voting Block Threshold": string, // percentage string, ends with %
    "Company Legal Form": string,
    "Company Name": string,
    "Governing Law Jurisdiction": string,
    "Investor Name": string,
    "Purchase Amount": string,
    "Purchase Date": string, // can we fromJSON this into a Date?
    "Time Notice is Effective after Deposit in the Mail": string,
    "Discount Rate": string | undefined,
    "Valuation Cap": string | undefined
}

interface Cap extends Common { "Valuation Cap": string }
interface Discount extends Common { "Discount Rate": string }
interface CapDiscount extends Cap, Discount { }
interface MFN extends Common { "Equity Financing Purchase Price Threshold": string }

interface ControlJSON { cap: boolean, discount: boolean }

enum Species { Cap, Discount, CapDiscount, MFN }

function nonzero(input: string): boolean {
    return (Number(input) > 0);
}

function read(file:string) {
    return fs.readFileSync(file).toString()
}

function new_merge_prefer_first<O1,O2>(obj1:O1,obj2:O2) : O1 | O2 {
    const rv = {} as O1|O2;
    Object.getOwnPropertyNames(obj2).forEach((name) => {
        (rv as any)[name] = (obj2 as any)[name];
    });
    Object.getOwnPropertyNames(obj1).forEach((name) => {
        (rv as any)[name] = (obj1 as any)[name];
    });
    
       
    return rv;
}

export function controller(userJSON: Common) {
    let [ControlJSON, guessedSpecies] = guessSpecies(userJSON);
    let [validationError, validation_rv] = validate(guessedSpecies, ControlJSON, userJSON); // should be either a Cap, Discount, CapDiscount, or MFN -- can typescript do that?
    if (validationError) {
        console.log("VALIDATION ERROR: " + validation_rv);
    }
    else {
        // turn the cftemplate into a commonform

        const mergedJSON = new_merge_prefer_first(userJSON,ControlJSON);

        

        console.log("running cftemplate now! wish me luck!");

        cftemplate(read('SAFE.cftemplate'),
            ".",
            mergedJSON,
            () => console.error("some error!"));

        // render the commonform into output
    }
}    

function guessSpecies(userJSON: Common): [ControlJSON, Species] {
    let controlJSON: ControlJSON = {
        cap: false,
        discount: false
    };
    let species: Species;

    // if (userJSON.hasOwnProperty("Discount Rate")
    //     && undefined != userJSON["Discount Rate"]
    //     && nonzero(userJSON["Discount Rate"])) { controlJSON.discount = true }
    // if (userJSON.hasOwnProperty("Valuation Cap")
    //     && undefined != userJSON["Valuation Cap"]
    //     && nonzero(userJSON["Valuation Cap"])) { controlJSON.cap = true }

    let discount_rate = userJSON["Discount Rate"];    
    if(discount_rate && nonzero(discount_rate))
        controlJSON.discount = true;
    let cap = userJSON["Valuation Cap"];
    if(cap && nonzero(cap))
        controlJSON.cap = true;


    if (controlJSON.discount && controlJSON.cap) { species = Species.CapDiscount }
    else if (controlJSON.discount) { species = Species.Discount }
    else if (controlJSON.cap) { species = Species.Cap }
    else { species = Species.MFN }

    return [controlJSON, species]
}

function validate(species:Species, controljson:ControlJSON, userjson:Common): [boolean, string] {
    // does typescript approve of the JSON object?
    // or should we be using http://json-schema.org/
    return [false, "this is fine."];
}

let opt = stdio.getopt();
console.log("moo");

let userjson = read("SAFE.user.json");

controller(userjson);
