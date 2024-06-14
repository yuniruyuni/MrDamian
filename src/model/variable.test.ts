import { expect, describe, it } from "vitest";
import { Value } from './variable';

describe("Variables", () => {
    it("can be split type with switch", () => {
        const values = [
            { type: "object", value: {}, },
            { type: "array", value: [], },
            { type: "boolean", value: true, },
            { type: "number", value: 1, },
            { type: "string", value: "test", },
            { type: "expression", value: "a < b", },
        ] as Value[];

        for( const v of values ) {
            switch(v.type) {
                case "boolean":
                    expect(v.value).toMatchObject(true);
                    break;
                case "number":
                    expect(v.value).toMatchObject(1);
                    break;
                case "string":
                    expect(v.value).toMatchObject("test");
                    break
                case "expression":
                    expect(v.value).toMatchObject("a < b");
                    break;
                case "array":
                    expect(v.value).toMatchObject([]);
                    break;
                case "object":
                    expect(v.value).toMatchObject({});
                    break;
                default:
                    expect(false);
                    break;
            }
        }
    });
});