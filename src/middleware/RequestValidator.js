import { validationResult } from "express-validator"

export const ValidateRequest = (req, res, next) => {
    const result = validationResult(req)
    if(result.isEmpty()){
        return next()
    }
    const errors = result.array()[0]
    console.log(errors)
    res.status(400).json({error:errors.msg})
}