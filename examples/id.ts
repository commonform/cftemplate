
// JSON -> JSON

export = function(inputJSON: Object): Object {
    return myAssign(inputJSON, {})
}

function myAssign<O1, O2>(obj1: O1, obj2: O2): O1 | O2 {
    const rv = {} as O1 | O2;
    Object.getOwnPropertyNames(obj2).forEach((name) => {
        (rv as any)[name] = (obj2 as any)[name];
    });
    Object.getOwnPropertyNames(obj1).forEach((name) => {
        (rv as any)[name] = (obj1 as any)[name];
    });

    return rv;
}

