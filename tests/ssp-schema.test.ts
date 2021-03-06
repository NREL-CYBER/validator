import Validator from "../src"
import * as sspSchema from "./schemas/oscal_ssp_schema.json"
import { v4 } from "uuid";
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
test("generates a workspace in the shape of the schema", () => {
    const partyValidator = new Validator<Party>(sspSchema, "party");
    const partialParty = partyValidator.makeWorkspace();
    expect(partialParty.hasOwnProperty("uuid")).toBeTruthy()
})
test("generates workspace data from schema behaving well even with a deeply nested allOf Ref Dictionary", () => {
    const sspValidator = new Validator<any>(sspSchema, "system_security_plan");
    const partialSSP = sspValidator.makeWorkspace();
    const defaultDiagramDescription = partialSSP.system_characteristics.authorization_boundary.description;

    expect(defaultDiagramDescription.length === 0).toBeTruthy()
})



test("generates a partial even for a massive schema", () => {
    const sspValidator = new Validator<any>(sspSchema, "system_security_plan");
    const partialSSP = sspValidator.makeWorkspace();
    expect(partialSSP.hasOwnProperty("metadata")).toBeTruthy()
})

test("Finds Property Refs correctly", () => {
    const sspValidator = new Validator<any>(sspSchema, "system_security_plan");
    const propInfo = sspValidator.getReferenceInformation({ items: { $ref: "#/definitions/property" } })
    expect(propInfo.title == "Property").toBeTruthy();
})
test("Finds nested Property Refs correctly", async () => {
    const sspValidator = new Validator<any>(sspSchema, "system_security_plan");
    const revisionValidator = await sspValidator.makeReferenceValidator({ items: { $ref: "#/definitions/revision" } })
    const propValidator = await revisionValidator.makeReferenceValidator({ items: { $ref: "#/definitions/property" } })
    expect(propValidator.title == "property").toBeTruthy();
})
test("Finds nested Property Refs correctly", async () => {
    const sspValidator = new Validator<any>(sspSchema, "system_security_plan");
    const documentIdValidator = await sspValidator.makeReferenceValidator(sspSchema.definitions.metadata.properties.document_ids)
    expect(documentIdValidator.rootSchema.title == "Document Identifier").toBeTruthy();
})


test("Creates a reference validator even for deeply nested properties", async () => {
    const sspValidator = new Validator(sspSchema, "system_security_plan");
    const resource_validator = await sspValidator.makeReferenceValidator<{ title: string, description: string, uuid: string }>(sspSchema.definitions.back_matter.properties.resources.items);
    expect(resource_validator.validate({ uuid: v4(), title: "nice" })).toBeTruthy();
})
test("Creates a reference validator even for deeply nested inline properties and still makes a workspace", async () => {
    const sspValidator = new Validator(sspSchema, "system_security_plan");
    const resource_validator = await sspValidator.makeReferenceValidator<{ title: string, description: string, uuid: string }>(sspSchema.definitions.back_matter.properties.resources.items);
    const workspace = resource_validator.makeWorkspace();
    expect(workspace).toBeTruthy();
})
test("Creates a valid uuid in the workspace when a custom generator is added", () => {
    const sspValidator = new Validator(sspSchema, "system_security_plan", {
        uuid: v4,
    });
    const ssp = sspValidator.makeWorkspace();
    const isValid = sspValidator.validate(ssp);

    const uuidIsValid = (sspValidator.validate.errors || []).filter(x => x.dataPath.includes("uuid")).length === 0;
    expect(uuidIsValid).toBeTruthy();
})





