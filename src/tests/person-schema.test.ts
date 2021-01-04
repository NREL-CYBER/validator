import Validator from "../validator"
import * as person from "./schemas/person-schema.json"

interface Person {
    firstName?: string
    lastName?: string
    age?: number
}

const reggie: Person = { firstName: "Reggie", lastName: "Watts" };
const reggieInCloud9: Person = { firstName: "Reggie", lastName: "Watts", age: -9 };

test("Validates a schema without definitions", () => {
    const personValidator = new Validator<Person>(person)
    expect(personValidator.validate(reggie)).toBeTruthy()
})

test("Schema with incorrect data does not validate", () => {
    const personValidator = new Validator<Person>(person)
    expect(personValidator.validate(reggieInCloud9)).toBeFalsy()
})

