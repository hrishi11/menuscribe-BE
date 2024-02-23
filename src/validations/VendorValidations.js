import { body, query } from "express-validator";

const getCustomerWithAddressValidation = [
    query("id").isInt().withMessage("Please Select a valid customer").bail()
]

const AddCustomerPackageValidation = [
    body("package_id").isInt().withMessage("Please Select a Package").bail(),
    body("customer_id").isInt().withMessage("Please Select a valid Customer").bail(),
    body("frequency").isString().withMessage("Please give a frequency").bail(),
    body("user_package_name").isString().withMessage("Please give a package name").bail(),
    body("handling").isString().withMessage("Please give a package name").bail(),
    body("delivery_address_id").isString().withMessage("Please give a package name").bail(),
    body("payment_status").isIn(["0","1"]).bail()
]

const UpdateCustomerPackageValidation = [
    body("package_id").isInt().withMessage("Please Select a Package").bail(),
    body("customer_package_id").isInt().withMessage("Please Select a Package").bail(),
    body("customer_id").isInt().withMessage("Please Select a valid Customer").bail(),
    body("frequency").isString().withMessage("Please give a frequency").bail(),
    body("user_package_name").isString().withMessage("Please give a package name").bail(),
    body("handling").isInt().withMessage("Please give a handling info").bail(),
    body("delivery_address_id").isInt().withMessage("Please give a delivery address").bail(),
    body("payment_status").isIn(["0","1"]).bail()
]
export {
    getCustomerWithAddressValidation,
    AddCustomerPackageValidation,
    UpdateCustomerPackageValidation
}
