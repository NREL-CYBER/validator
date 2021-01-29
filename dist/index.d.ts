import { ValidateFunction } from "ajv";
import { SchemaObject } from "ajv";
export interface PropertyInfo {
    title?: string;
    description?: string;
}
export interface PropertyDefinitionRef extends PropertyInfo {
    $id?: string;
    $ref?: string;
    items?: {
        $ref?: string;
        type?: string;
    };
    allOf?: {
        not?: string;
        $ref?: string;
    }[];
    anyOf?: {
        not?: string;
        $ref?: string;
    }[];
    type?: string;
    multipleOf?: number;
    minimum?: number;
    format?: "number" | "time" | "text" | "date" | "email" | "password" | "search" | "tel" | "url" | "week" | "month" | "datetime-local" | undefined;
}
export interface RootSchemaObject {
    $id?: string;
    $comment?: string;
    $schema?: string;
    title?: string;
    type?: string;
    description?: string;
    definitions?: Record<string, any>;
    properties?: Record<string, any>;
    required?: string[];
    additionalProperties?: [] | boolean;
    dependencies?: Record<string, string[]>;
}
export interface SchemaObjectDefinition extends SchemaObject, PropertyInfo {
    properties?: Record<string, PropertyDefinitionRef>;
    type?: string;
    $id?: string;
    format?: string;
    pattern?: string;
    $comment?: string;
    additionalProperties?: [] | boolean;
}
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
