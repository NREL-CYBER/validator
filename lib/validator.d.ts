import { ValidateFunction } from "ajv";
import { RootSchemaObject } from "index";
import { SchemaObjectDefinition } from "./schema-types";
import { PropertyDefinitionRef } from "lib/validator";
/**
 * A class to Compile a validation schema
 * into a strongly typed validation function
 */
export default class Validator<T> {
    /**
     * Validate a Data  against a compiled JSON Schema
     */
    validate: ValidateFunction<T>;
    /**
     * The Definition of the schema
     */
    definition: string;
    /**
     * The Root of the schema
     */
    rootSchema: RootSchemaObject;
    /**
     * The Schema in regards to the particular definition
     */
    schema: SchemaObjectDefinition;
    /**
     * The Title of defintion
     */
    title: string;
    /**
     * Make a validator for a referenced attribute
     */
    makeReferenceValidator: <RT>(propertyDefinition: PropertyDefinitionRef) => Validator<RT>;
    /**
     * Make a validator for a referenced attribute
     */
    getReferenceInformation: (propertyDefinition: PropertyDefinitionRef) => SchemaObjectDefinition;
    /**
     * Create an object that has the shape of the schema
     */
    makePartial: (propertyDefinitionReference?: PropertyDefinitionRef) => T;
    /**
     * Determine if this validator is for the root schema object
     */
    isRootSchema: boolean;
    /**
     * Compile a validation schema
     * into a strongly typed validation function
     * @param validSchema Schema in JsonSchema 7.0 format
     * @param definition The specific definition of the schema to validate against
     */
    constructor(validSchema: RootSchemaObject, definition?: string);
}
