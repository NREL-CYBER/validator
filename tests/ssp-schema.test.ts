import Validator from "../dist"
import * as sspSchema from "./schemas/oscal_ssp_schema.json"
const snakeCaseKeys = require('snakecase-keys')


interface Party {
    uuid: string,
    name: string
    type: "organization" | "person"
}
const NREL: Party = { name: "NREL", type: "organization", uuid: "520dc1f7-c5ae-4764-bb2b-c595c8eebefe" };

test("Validates a schema definition", () => {
    const partyValidator = new Validator(sspSchema, "party");
    const isValid = partyValidator.validate(NREL);
    const errors = partyValidator.validate.errors
    expect(isValid).toBeTruthy()
})

test("returns errors for invalid data", () => {
    const partyValidator = new Validator<Party>(sspSchema, "party");
    expect(partyValidator.validate({ name: "~" })).toBeFalsy()
})
test("generates partial data from schema", () => {
    const partyValidator = new Validator<Party>(sspSchema, "party");
    const partialParty = partyValidator.makePartial();
    expect(partialParty.hasOwnProperty("name")).toBeTruthy()
})

test("generates a partial even for a massive schema", () => {
    const sspValidator = new Validator<unknown>(sspSchema, "system_security_plan");
    const partialSSP = sspValidator.makePartial();
    expect(partialSSP.hasOwnProperty("metadata")).toBeTruthy()
})



