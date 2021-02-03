"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _ajv = _interopRequireDefault(require("ajv"));

var _ajvFormats = _interopRequireDefault(require("ajv-formats"));

var _uuid = require("uuid");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * A class to Compile a validation schema 
 * into a strongly typed validation function
 */
var Validator =
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
function Validator(validSchema, definition) {
  var _this = this;

  _classCallCheck(this, Validator);

  _defineProperty(this, "validate", void 0);

  _defineProperty(this, "definition", void 0);

  _defineProperty(this, "rootSchema", void 0);

  _defineProperty(this, "schema", void 0);

  _defineProperty(this, "title", void 0);

  _defineProperty(this, "makeReferenceValidator", void 0);

  _defineProperty(this, "getReferenceInformation", void 0);

  _defineProperty(this, "makePartial", void 0);

  _defineProperty(this, "isRootSchema", void 0);

  this.title = definition || validSchema.$comment || "";
  this.rootSchema = validSchema;
  var root = validSchema["$id"] || "";

  if (typeof definition === "string") {
    this.definition = root + "#/definitions/" + definition;
    this.schema = this.rootSchema.definitions && this.rootSchema.definitions[definition];
    this.isRootSchema = false;
  } else {
    this.definition = root;
    this.schema = this.rootSchema;
    this.isRootSchema = true;
  }

  var jsonValidator = new _ajv["default"]({
    allErrors: true
  });
  (0, _ajvFormats["default"])(jsonValidator);
  jsonValidator.addSchema(validSchema);
  var compiledValidator = jsonValidator.getSchema(this.definition);

  if (!compiledValidator) {
    throw "Invalid Schema Definition";
  } else {
    this.validate = compiledValidator;
  } // Given a property get the information from 


  var findDefinitionPath = function findDefinitionPath(propertyInfo) {
    // just the regular base propertyies
    if ("type" in propertyInfo && ["string", "boolean", "number"].includes(propertyInfo["type"])) {
      return propertyInfo;
    }

    if (propertyInfo.type === "array" && typeof propertyInfo.items.$ref === "undefined") {
      return propertyInfo;
    } // arrays references objects and more advanced properties


    var path = propertyInfo.$ref || propertyInfo.$id || propertyInfo.items && propertyInfo.items.$ref || propertyInfo.additionalProperties && propertyInfo.additionalProperties["allOf"][0].$ref;

    if (typeof path !== "string") {
      return undefined;
    }

    return path;
  };

  var getDefinitionIndex = function getDefinitionIndex(definitionPath) {
    if (typeof definitionPath !== "string") {
      return definitionPath;
    }

    return definitionPath.split("/").pop() || "";
  };

  this.getReferenceInformation = function (propertyInfo) {
    var definitionIndex = getDefinitionIndex(findDefinitionPath(propertyInfo));
    return _this.rootSchema.definitions && _this.rootSchema.definitions[definitionIndex] || propertyInfo;
  };

  this.makeReferenceValidator = function (propertyInfo) {
    var definitions = _this.rootSchema.definitions;

    if (typeof propertyInfo.$ref === "undefined" && typeof (propertyInfo.items ? propertyInfo.items.$ref : undefined) === "undefined") {
      var items = propertyInfo.items;

      if (items) {
        return new Validator(_objectSpread(_objectSpread({}, items), {}, {
          $id: (0, _uuid.v4)(),
          definitions: definitions
        }));
      }
    }

    var definitionIndex = getDefinitionIndex(findDefinitionPath(propertyInfo));

    if (typeof definitionIndex === "undefined" && propertyInfo.properties) {
      // Inline Sub Object
      return new Validator(_objectSpread(_objectSpread({}, propertyInfo), {}, {
        $id: (0, _uuid.v4)(),
        definitions: definitions
      }));
    }

    return new Validator(_this.rootSchema, definitionIndex);
  };

  this.makePartial = function (propertyDefinitionReference) {
    var schema = _this.schema;

    if (propertyDefinitionReference) {
      schema = _this.getReferenceInformation(propertyDefinitionReference);
    }

    var defaulObjectProperties = schema.properties ? Object.keys(schema.properties).map(function (prop) {
      var propName = prop;
      var propRef = schema.properties && schema.properties[prop];

      if (propName === "undefined" || typeof propName === "undefined") {
        return {};
      }

      if (propRef && propRef.type && propRef.type == "array") {
        return _defineProperty({}, propName, []);
      } else if (schema && schema.properties && schema.properties[prop]) {
        var propInfo = _this.getReferenceInformation(schema.properties[prop]);

        if (propInfo.type === "object") return _defineProperty({}, propName, propRef ? _this.makePartial(propRef) : {});else {
          return _defineProperty({}, propName, "");
        }
      } else {
        return {};
      }
    }) : [{}];
    var defaultObject = defaulObjectProperties.reduce(function (prev, next) {
      return _objectSpread(_objectSpread({}, prev), next);
    });
    return defaultObject;
  };
};

exports["default"] = Validator;