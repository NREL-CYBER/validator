import Ajv, { ValidateFunction } from "ajv"
import addFormats from "ajv-formats"
import { SchemaObject } from "ajv";


export interface PropertyInfo {
    title?: string
    description?: string
}

export interface PropertyDefinitionRef extends PropertyInfo {
    $id?: string,
    $ref?: string
    items?: {
        $ref?: string
        type?: string
    }
    allOf?: { not?: string, $ref?: string }[]
    anyOf?: { not?: string, $ref?: string }[]
    type?: string
    multipleOf?: number;
    minimum?: number;
    properties?: Record<string, PropertyDefinitionRef>
    format?: "iri" | "iri-reference" | "uri-template" | "date" | "email" | "password" | "idn-email" | "idn-hostname" | "json-pointer" | "regex" | undefined
    writeOnly?: boolean
    readOnly?: boolean
}



export interface RootSchemaObject {
    $id?: string,
    $comment?: string
    $schema?: string,
    title?: string,
    type?: string,
    description?: string,
    definitions?: Record<string, any>
    properties?: Record<string, any>
    required?: string[]
    additionalProperties?: [] | boolean
    dependencies?: Record<string, string[]>
}


export interface SchemaObjectDefinition extends SchemaObject, PropertyInfo {
    properties?: Record<string, PropertyDefinitionRef>
    type?: string
    $id?: string,
    format?: string,
    pattern?: string,
    $comment?: string
    additionalProperties?: [] | boolean
}


/**
 * A class to Compile a validation schema 
 * into a strongly typed validation function
 */
export default class Validator<T> {
    /**
     * Validate a Data  against a compiled JSON Schema
     */
    validate: ValidateFunction<T>
    /**
     * The Definition of the schema
     */
    definition: string
    /**
     * The Root of the schema
     */
    rootSchema: RootSchemaObject
    /**
     * The Schema in regards to the particular definition
     */
    schema: SchemaObjectDefinition
    /**
     * The Title of defintion
     */
    title: string
    /**
     * Make a validator for a referenced attribute
     */
    makeReferenceValidator: <RT>(propertyDefinition: PropertyDefinitionRef) => Validator<RT>
    /**
     * Make a validator for a referenced attribute
     */
    getReferenceInformation: (propertyDefinition: PropertyDefinitionRef) => SchemaObjectDefinition
    /**
     * Create an object that has the shape of the schema
     */
    makePartial: (propertyDefinitionReference?: PropertyDefinitionRef) => T
    /**
     * Determine if this validator is for the root schema object
     */
    isRootSchema: boolean
    /**
     * Compile a validation schema 
     * into a strongly typed validation function
     * @param validSchema Schema in JsonSchema 7.0 format
     * @param definition The specific definition of the schema to validate against
     */
    constructor(validSchema: RootSchemaObject, definition?: string) {
        this.title = definition || validSchema.$comment || "";
        this.rootSchema = validSchema;
        const root = (validSchema as any)["$id"];
        if (typeof definition === "string") {
            this.definition = root + "#/definitions/" + definition;
            this.schema = this.rootSchema.definitions && this.rootSchema.definitions[definition];
            this.isRootSchema = false;
        } else {
            this.definition = root;
            this.schema = this.rootSchema;
            this.isRootSchema = true;
        }
        const jsonValidator = new Ajv({ allErrors: true });

        addFormats(jsonValidator)
        jsonValidator.addSchema(validSchema);

        const compiledValidator = jsonValidator.getSchema<T>(this.definition);

        if (!compiledValidator) {
            throw "Invalid Schema Definition";
        } else {
            this.validate = compiledValidator as ValidateFunction<T>;
        }

        // Given a property get the information from 
        const findDefinitionPath = (propertyInfo: any) => {
            // just the regular base propertyies
            if ("type" in propertyInfo && ["string", "boolean", "number"].includes(propertyInfo["type"])) {
                return propertyInfo;
            }
            if (propertyInfo.type === "array" && typeof propertyInfo.items.$ref === "undefined") {
                return propertyInfo;
            }

            // arrays references objects and more advanced properties
            const path = propertyInfo.$ref || propertyInfo.$id || propertyInfo.items &&
                propertyInfo.items.$ref || (propertyInfo.additionalProperties &&
                    propertyInfo.additionalProperties["allOf"][0].$ref)
            if (typeof path !== "string") {
                return undefined;
            }
            return path;
        }

        const getDefinitionIndex = (definitionPath: string) => {
            if (typeof definitionPath !== "string") {
                return definitionPath
            }

            return definitionPath.split("/").pop() || "";
        }

        this.getReferenceInformation = (propertyInfo: PropertyDefinitionRef) => {
            const definitionIndex = getDefinitionIndex(findDefinitionPath(propertyInfo));
            return this.rootSchema.definitions && this.rootSchema.definitions[definitionIndex] || propertyInfo;
        }
        this.makeReferenceValidator = <RT>(propertyInfo: PropertyDefinitionRef) => {
            const { definitions } = this.rootSchema;
            if (typeof propertyInfo.$ref === "undefined" && typeof (propertyInfo.items ? propertyInfo.items.$ref : undefined) === "undefined") {
                const items = propertyInfo.items;
                if (items) {
                    return new Validator<RT>({ ...items, $id: undefined, definitions });
                }
            }
            const definitionIndex = getDefinitionIndex(findDefinitionPath(propertyInfo));
            if (typeof definitionIndex === "undefined" && propertyInfo.properties) {
                // Inline Sub Object
                return new Validator<RT>({ ...propertyInfo, ...definitions })
            }
            return new Validator<RT>(this.rootSchema, definitionIndex);
        }
        this.makePartial = <T>(propertyDefinitionReference?: PropertyDefinitionRef) => {
            let schema: SchemaObjectDefinition = this.schema
            if (propertyDefinitionReference) {
                schema = this.getReferenceInformation(propertyDefinitionReference);
            }
            const defaulObjectProperties = schema.properties ? Object.keys(schema.properties).map(prop => {
                const propName = prop;
                const propRef = schema.properties && schema.properties[prop];
                if (propName === "undefined" || typeof (propName) === "undefined") {
                    return {}
                }
                if (propRef && propRef.type && propRef.type == "array") {
                    return { [propName]: [] }
                } else if (schema && schema.properties && schema.properties[prop]) {
                    const propInfo = this.getReferenceInformation(schema.properties[prop]);
                    if (propInfo.type === "object")
                        return { [propName]: propRef ? this.makePartial(propRef) : {} }
                    else {
                        return { [propName]: "" }
                    }
                } else {
                    return {};
                }
            }) : [{}]

            const defaultObject = defaulObjectProperties.reduce((prev, next) => {
                return { ...prev, ...next } as any;
            })
            return defaultObject as unknown as T;
        }
    }
}