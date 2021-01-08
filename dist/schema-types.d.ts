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
}
export interface RootSchemaObject {
    $id: string;
    $comment?: string;
    $schema?: string;
    title?: string;
    type?: string;
    description?: string;
    definitions?: Record<string, any>;
    properties: Record<string, any>;
    required?: string[];
    additionalProperties?: [] | boolean;
    dependencies?: Record<string, string[]>;
}
export interface SchemaObjectDefinition extends SchemaObject, PropertyInfo {
    properties?: Record<string, PropertyDefinitionRef>;
    type?: string;
    $id: string;
    format?: string;
    pattern?: string;
    $comment?: string;
    additionalProperties?: [] | boolean;
}
