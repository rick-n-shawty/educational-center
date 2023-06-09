const { StatusCodes } = require("http-status-codes")
const jwt = require('jsonwebtoken')
const {Unauthorized} = require('../Error/ErrorSamples')
const isAdmin = require('../helperFuncs/checkIfAdmin')
const ErrorHandler = require('../Error/ErrorHandler')
const verifyAdmin = async (req, res, next) => {
    try{
        const headers = req.headers.authorization 
        if(!headers || !headers.startsWith('Bearer')) throw new Unauthorized("Not authorized to access this endpoint")
        const token = headers.split(' ')[1] 
        jwt.verify(token, process.env.JWT_ACCESS_KEY, async (err, decoded) =>{
            if(err){
                return res.status(StatusCodes.UNAUTHORIZED).json({err: 'Unauthorized'}) 
            }
            const isValidAdmin = await isAdmin(decoded.userId)
            if(!isValidAdmin) return res.status(StatusCodes.UNAUTHORIZED).json({err: 'You do not have admin permissions to modify this resource'})
            req.userId = decoded.userId 
            next()
        })
    }catch(err){
        console.log(err)
        return ErrorHandler(err, req, res)
    }
}

module.exports = verifyAdmin