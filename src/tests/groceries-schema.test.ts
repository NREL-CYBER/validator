import Validator from "../validator"
import * as groceriesSchema from "./schemas/groceries-schema.json"

type Fruit = string;
interface Veggie {
    veggieName: string
    veggieLike: boolean
}
const brocolli: Veggie = { veggieLike: true, veggieName: "baracoli obama" };
const tomato: Fruit = "Heirloom Tomato";

interface Groceries {
    fruits: Fruit[]
    veggies: Veggie[]
}
const groceryList: Groceries = {
    veggies: [brocolli],
    fruits: [tomato]
}

const invalidGroceryList = {
    veggies: [brocolli, 9],
    fruits: [tomato, { veggieLike: "yeee", veggieName: "Chocolate" }]
}

test("Validates a schema definition", () => {
    const veggieValidator = new Validator<Veggie>(groceriesSchema, "veggie");
    expect(veggieValidator.validate(brocolli)).toBeTruthy()
})

test("Validates the root schema definition", () => {
    const groceryValidator = new Validator<Groceries>(groceriesSchema);
    expect(groceryValidator.validate(groceryList)).toBeTruthy()
})
test("returns errors for invalid data", () => {
    const groceryValidator = new Validator<Groceries>(groceriesSchema);
    expect(groceryValidator.validate(invalidGroceryList)).toBeFalsy()
    expect(groceryValidator.validate.errors).toBeTruthy();
})


