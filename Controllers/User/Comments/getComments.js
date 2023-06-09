const Lesson = require('../../../DB/models/Lesson')
const Comment = require('../../../DB/models/Comment')
const User = require('../../../DB/models/User')
const getUrl = require('../../../helperFuncs/getUrl')
const { StatusCodes } = require('http-status-codes')
const joi = require('joi')
const { BadRequest, NotFound } = require('../../../Error/ErrorSamples')

async function verifyQuery(query){
    try{
        const joiSchema = joi.object({
            lessonId: joi.string().required().min(10),
            lim: joi.number().positive().allow(0),
            skip: joi.number().positive().allow(0)
        })
        const {error, value} = joiSchema.validate(query)
        if(error){
            throw error 
        }
        return value 
    }catch(err){
        throw err
    }
}

const getComments = async (req, res, next) =>{
    const userId = req.userId
    try{ 
        if(req.query.lim && req.query.skip){
            req.query.lim = Number(req.query.lim)
            req.query.skip = Number(req.query.skip)
        }else{
            throw BadRequest("Must Provide Valid Query Parameters")
        }
        const {lessonId, lim, skip} = await verifyQuery(req.query)
        if(!lessonId) throw new BadRequest("Lesson ID is missing")
        const lesson = await Lesson.findById(lessonId, {comments: 1})
        if(!lesson) throw new NotFound(`Lesson with Id ${lessonId} not found`)
        const comments = await Comment.find({lessonId: lessonId}).sort({createdAt: -1}).limit(lim).skip(skip) 
        const data = []
        const hashMap = {} 
        for(const comment of comments){
            const tempComment = {
                id: comment._id,
                likes: comment.likes.length,
                disLikes: comment.disLikes.length,
                comment: comment.comment,
                userPicture: "",
                username: "",
                useremail: "",
                createdBy: comment.createdBy,
                isLiked: undefined,
                isDisliked: undefined
            }
            if(!hashMap[comment.createdBy]){
                const user = await User.findById(comment.createdBy, {profilePicture: 1, name: 1, email: 1})
                if(!user){
                    continue 
                }
                const tempUser = { 
                    profilePicture: getUrl(user.profilePicture),
                    name: user.name,
                    email: user.email
                }
                hashMap[comment.createdBy] = tempUser
                tempComment.userPicture = tempUser.profilePicture 
                tempComment.username = tempUser.name
                tempComment.useremail = tempUser.email
                tempComment.isLiked = comment.usersLiked[userId] ? true : false 
                tempComment.isDisliked = comment.usersDisliked[userId] ? true : false
                data.push(tempComment)
            }else if(hashMap[comment.createdBy]){
                const user = hashMap[comment.createdBy]
                tempComment.userPicture = user.profilePicture 
                tempComment.username = user.name 
                tempComment.useremail = user.email
                tempComment.isLiked = comment.usersLiked[userId] ? true : false 
                tempComment.isDisliked = comment.usersDisliked[userId] ? true : false
                data.push(tempComment)
            }
        }
        return res.status(StatusCodes.OK).json({number: comments.length, comments: data, userId})
    }catch(err){
        return next(err)
    }
}

module.exports = getComments