import { ValidateFunction } from "ajv";
import { SchemaObject } from "ajv";
export interface PropertyInfo {
    title?: string;
    description?: string;
}
export interface PropertyDefinitionRef extends PropertyInfo {
    $id?: string;
    $ref?: string;
    items?: PropertyDefinitionRef | Record<string, PropertyDefinitionRef>;
    allOf?: {
        not?: string;
        $ref?: string;
    }[];
    anyOf?: {
        not?: string;
        $ref?: string;
    }[];
    type?: string;
    enum?: string[];
    multipleOf?: string;
    minItems?: number;
    properties?: Record<string, PropertyDefinitionRef>;
    format?: "iri" | "iri-reference" | "uri-template" | "date" | "email" | "password" | "idn-email" | "idn-hostname" | "json-pointer" | "regex" | string | undefined;
    writeOnly?: boolean;
    readOnly?: boolean;
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
    dependentRequired?: Record<string, string[]>;
}
export interface SchemaObjectDefinition extends SchemaObject, PropertyInfo {
    properties?: Record<string, PropertyDefinitionRef>;
    type?: string;
    $id?: string;
    items?: PropertyDefinitionRef[];
    format?: string;
    pattern?: string;
    $comment?: string;
    required?: string[];
    dependentRequired?: Record<string, string[]>;
    additionalProperties?: PropertyDefinitionRef;
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
    makeReferenceValidator: <RT>(propertyDefinition: PropertyDefinitionRef) => Promise<Validator<RT>>;
    /**
     * Make a validator for a referenced attribute
     */
    getReferenceInformation: (propertyDefinition: PropertyDefinitionRef) => SchemaObjectDefinition;
    /**
     * Create an object that has the shape of the schema
     */
    makeWorkspace: (propertyDefinitionReference?: PropertyDefinitionRef) => T;
    /**
     * Determine if this validator is for the root schema object
     */
    isRootSchema: boolean;
    /**
     * Custom Workspace Generation
     */
    workspaceGenerationMap: Record<string, () => any>;
    /**
     * Compile a validation schema
     * into a strongly typed validation function
     * @param validSchema Schema in JsonSchema 7.0 format
     * @param definition The specific definition of the schema to validate against
     * @param workspaceGenerationMap A map of custom fields to generate when making workspace
     */
    constructor(validSchema: RootSchemaObject, definition?: string, workspaceGenerationMap?: Record<string, () => any>);
}
