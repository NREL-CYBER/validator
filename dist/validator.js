import Ajv from "ajv";
import addFormats from "ajv-formats";

/**
 * A class to Compile a validation schema 
 * into a strongly typed validation function
 */
export default class Validator {
  /**
   * Validate a Data  against a compiled JSON Schema
   */

  /**
   * The Definition of the schema
   */

  /**
   * The Root of the schema
   */

  /**
   * The Schema in regards to the particular definition
   */

  /**
   * The Title of defintion
   */

  /**
   * Make a validator for a referenced attribute
   */

  /**
   * Make a validator for a referenced attribute
   */

  /**
   * Create an object that has the shape of the schema
   */

  /**
   * Determine if this validator is for the root schema object
   */

  /**
   * Compile a validation schema 
   * into a strongly typed validation function
   * @param validSchema Schema in JsonSchema 7.0 format
   * @param definition The specific definition of the schema to validate against
   */
  constructor(validSchema, definition) {
    this.title = definition || validSchema.$comment || "";
    this.rootSchema = validSchema;
    const root = validSchema["$id"];

    if (definition) {
      this.definition = root + "#/definitions/" + definition;
      this.schema = this.rootSchema.definitions && this.rootSchema.definitions[definition];
      this.isRootSchema = false;
    } else {
      this.definition = root;
      this.schema = this.rootSchema;
      this.isRootSchema = true;
    }

    const jsonValidator = new Ajv();
    addFormats(jsonValidator);
    jsonValidator.addSchema(validSchema);
    const compiledValidator = jsonValidator.getSchema(this.definition);

    if (!compiledValidator) {
      throw "Invalid Schema Definition";
    } else {
      this.validate = compiledValidator;
    } // Given a property get the information from 


    const findDefinitionPath = propertyInfo => {
      // just the regular base propertyies
      if ("type" in propertyInfo && ["string", "boolean", "number"].includes(propertyInfo["type"])) {
        return propertyInfo;
      } // arrays references objects and more advanced properties


      const path = propertyInfo.$ref || propertyInfo.$id || propertyInfo.items && propertyInfo.items.$ref || propertyInfo.additionalProperties && propertyInfo.additionalProperties["allOf"][0];

      if (typeof path !== "string") {
        console.log(propertyInfo);
        throw "Invalid Property Info ";
        return "";
      }

      return path;
    };

    const getDefinitionIndex = definitionPath => {
      if (typeof definitionPath !== "string") {
        return "";
      }

      return definitionPath.split("/").pop() || "";
    };

    this.getReferenceInformation = propertyInfo => {
      const definitionIndex = getDefinitionIndex(findDefinitionPath(propertyInfo));
      return this.rootSchema.definitions && this.rootSchema.definitions[definitionIndex] || propertyInfo;
    };

    this.makeReferenceValidator = propertyInfo => {
      const definitionIndex = getDefinitionIndex(findDefinitionPath(propertyInfo));
      return new Validator(this.rootSchema, definitionIndex);
    };

    this.makePartial = propertyDefinitionReference => {
      let schema = this.schema;

      if (propertyDefinitionReference) {
        schema = this.getReferenceInformation(propertyDefinitionReference);
      }

      const defaulObjectProperties = schema.properties ? Object.keys(schema.properties).map(prop => {
        const propName = prop;
        const propRef = schema.properties && schema.properties[prop];

        if (propName === "undefined" || typeof propName === "undefined") {
          return {};
        }

        if (propRef && propRef.type && propRef.type == "array") {
          return {
            [propName]: []
          };
        } else if (schema && schema.properties && schema.properties[prop]) {
          const propInfo = this.getReferenceInformation(schema.properties[prop]);
          if (propInfo.type === "object") return {
            [propName]: propRef ? this.makePartial(propRef) : {}
          };else {
            return {
              [propName]: ""
            };
          }
        } else {
          return {};
        }
      }) : [{}];
      const defaultObject = defaulObjectProperties.reduce((prev, next) => {
        return { ...prev,
          ...next
        };
      });
      return defaultObject;
    };
  }

}