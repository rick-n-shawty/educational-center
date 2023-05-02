const levelsArray = ['beginner', 'elementary', 'pre-intermediate', 'intermediate', 'upper-intermediate', 'ielts']
const supportedVideoFormatsArray = ['.mov', '.mp4', '.avi']
const supportedImageFormatsArray = ['.png', '.jpeg', '.jpg']
const supportedVideoLanguages = ['english', 'russian', 'uzbek']
const {S3} = require('@aws-sdk/client-s3')
const { CloudFrontClient } = require('@aws-sdk/client-cloudfront')
const Sib = require('sib-api-v3-sdk')
const client = Sib.ApiClient.instance 
const apiKey = client.authentications['api-key']
apiKey.apiKey = process.env.EMAIL_API_KEY
const transEmailsApi = new Sib.TransactionalEmailsApi()
const s3 = new S3({
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY
    },
    region: process.env.AWS_REGION
})

const CloudFront = new CloudFrontClient({
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY
    },
    region: process.env.AWS_REGION
})

module.exports = {
    levelsArray,
    s3,
    CloudFront,
    supportedImageFormatsArray,
    supportedVideoFormatsArray,
    supportedVideoLanguages,
    transEmailsApi
}