#!/usr/bin/env node

// http://choly.ca/post/typescript-json/ may be relevant one day

import cftemplate = require('../index.js');
import fs = require('fs');
// import glob = require('glob');
// import path = require('path');
// apparently this form makes tsc not complain about missing type declaration files
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
type CapDiscount = Cap | Discount
interface MFN extends Common { "Equity Financing Purchase Price Threshold": string }

interface ControlJSON { cap: boolean, discount: boolean }

enum Species { Cap, Discount, CapDiscount, MFN }

function nonzero(input: string): boolean {
    return Number(input.replace(/[^\d\.]/g, "")) > 0;
}

function read(file: string): string {
    return fs.readFileSync(file).toString()
}

function new_merge_prefer_first<O1, O2>(obj1: O1, obj2: O2): O1 | O2 {
    const rv = {} as O1 | O2;
    Object.getOwnPropertyNames(obj2).forEach((name) => {
        (rv as any)[name] = (obj2 as any)[name];
    });
    Object.getOwnPropertyNames(obj1).forEach((name) => {
        (rv as any)[name] = (obj1 as any)[name];
    });


    return rv;
}

export function controller(cfTemplateFile: string, userJSON: Common) {
    let [ControlJSON, guessedSpecies] = guessSpecies(userJSON);
    //    console.error("guessed controlJSON: " + JSON.stringify(ControlJSON));
    //    console.error("guessed species: " + Species[guessedSpecies]);
    let [validationError, validation_rv] = validate(guessedSpecies, ControlJSON, userJSON);
    if (validationError) {
        console.error("VALIDATION ERROR: " + validation_rv);
    }
    else {
        // turn the cftemplate into a commonform

        const mergedJSON = new_merge_prefer_first(ControlJSON, userJSON);

        var cftemplateOutput: string;
        let cftemplateInput: string = read(cfTemplateFile);

        cftemplate(cftemplateInput,
            "examples/",
            mergedJSON,
            (err, output) => {
                if (err) {
                    //                    console.error("onoes, cftemplate haz error " + err)
                } else {
                    //                    console.error("no error from cftemplate")

                    // for some reason we can't just define cftemplateOutput = output
                    // the binding never makes it out to the enclosing scope
                    // so we'll just continue in here.

                    let cftemplateOutput = output

                    const cfoutfile = cfTemplateFile.replace(/\.cftemplate/, ".commonform")

                    let cfoutfh = require('fs').createWriteStream(cfoutfile);
                    cfoutfh.write(output)
                    cfoutfh.close()

                    // render the commonform into output
                    //                    console.error("cftemplate turned " + cftemplateInput.length + " bytes of input into " + cftemplateOutput.length + " bytes of output.");

                    let opt = { "--blank-text": null, "--blanks": null, "--color": false, "--edition": null, "--format": "terminal", "--hash": false, "--help": false, "--indent-margins": false, "--left-align-title": false, "--mark-filled": false, "--number": "decimal", "--ordered-lists": false, "--signatures": null, "--title": null, "--usage": false, "--version": false, "-h": false, "-v": false, "<": false, "EDITION": null, "PROJECT": null, "blanks": false, "critique": false, "definitions": false, "directions": false, "hash": false, "headings": false, "lint": false, "publish": false, "references": false, "render": true, "uses": false, blanksObj: mergedJSON }

                    let format = "terminal";

                    const stream = require('stream');
                    const fakeStdin = require('fs').createReadStream(cfoutfile)
                    const fakeStdout = process.stdout;
                    const fakeStderr = process.stderr;

                    // maybe i should just use https://www.npmjs.com/package/mock-cli

                    const route = require('commonform-cli/source/route.js');
                    var handler = route(fakeStdin, fakeStdout, fakeStderr, {}, opt);
                    if (handler) {
                        handler((n: number) => { });
                    } else {
                        console.error("route did not return a handler");
                    }
                }
            }
        )
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
    if (discount_rate && nonzero(discount_rate))
        controlJSON.discount = true;
    let cap = userJSON["Valuation Cap"];
    if (cap && nonzero(cap))
        controlJSON.cap = true;


    if (controlJSON.discount && controlJSON.cap) { species = Species.CapDiscount }
    else if (controlJSON.discount) { species = Species.Discount }
    else if (controlJSON.cap) { species = Species.Cap }
    else { species = Species.MFN }

    return [controlJSON, species]
}

function validate(species: Species, controljson: ControlJSON, userjson: Common): [boolean, string] {
    // does typescript approve of the JSON object?
    // or should we be using http://json-schema.org/
    return [false, "this is fine."];
}

let opt = stdio.getopt();

let [cftemplateFile, userJsonFile] = opt.args;

controller(cftemplateFile, JSON.parse(read(userJsonFile)));


