import { expect, describe, it } from "vitest";
import { Parameters, Environment } from './variable';

describe("Parameters", () => {
    it("can contains basic types", () => {
        const params: Parameters = {
            "string": "test",
            "expression": "$ a < b",
            "boolean": true,
            "number": 1,
            "array": [],
            "object": {},
        };

        for( const [k, v] of Object.entries(params) ) {
            switch(k) {
                case "boolean":
                    expect(v).toMatchObject(true);
                    break;
                case "number":
                    expect(v).toMatchObject(1);
                    break;
                case "string":
                    expect(v).toMatchObject("test");
                    break
                case "expression":
                    expect(v).toMatchObject("$ a < b");
                    break;
                case "array":
                    expect(v).toMatchObject([]);
                    break;
                case "object":
                    expect(v).toMatchObject({});
                    break;
                default:
                    expect(false);
                    break;
            }
        }
    });
});

describe("Environment", {}, () => {
    it("can contains basic types", () => {
        const params: Environment = {
            "string": "test",
            // "expression": "$ a < b", // Environment is already evaluated so expression type is not exists.
            "boolean": true,
            "number": 1,
            "array": [],
            "object": {},
        };

        for( const [k, v] of Object.entries(params) ) {
            switch(k) {
                case "boolean":
                    expect(v).toMatchObject(true);
                    break;
                case "number":
                    expect(v).toMatchObject(1);
                    break;
                case "string":
                    expect(v).toMatchObject("test");
                    break
                case "expression":
                    expect(v).toMatchObject("$ a < b");
                    break;
                case "array":
                    expect(v).toMatchObject([]);
                    break;
                case "object":
                    expect(v).toMatchObject({});
                    break;
                default:
                    expect(false);
                    break;
            }
        }
    });
});