import {User} from '../models/userModel.js'
import crypto from 'node:crypto'
import bcryptjs from 'bcryptjs'
import { generateVerificationCode } from '../utils/generateVerificationCode.js'
import {generateTokenAndSetCookie} from '../utils/generateTokenAndSetCookie.js'
import { sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail, sendResetSuccessEmail } from '../mailTrap/emails.js'

export const signUp = async (req, res) => {
    const {email, password, name} = req.body
    try {
        if(!email || !password || !name){
            throw new Error('All Fields Are Required')
        }

        const userAlreadyExists = await User.findOne({email})
        if(userAlreadyExists){
            return res.status(400).json({success:false, message:'user already exists'})
        }

        const hashedPassword = await bcryptjs.hash(password, 10)

        const VerificationToken = generateVerificationCode()

        const user = new User({
            email,
            password: hashedPassword,
            name,
            VerificationToken, 
            VerificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000,
        })

        await user.save()

        generateTokenAndSetCookie(res, user._id)

        sendVerificationEmail(user.email, VerificationToken)

        res.status(201).json({
            success: true,
            message:'User Created Successfully',
            user: {
                ...user._doc,
                password:undefined
            }
        })
    } catch (error) {
        res.status(400).json({success:false, message:error.message})
    }
}

export const verifyEmail = async(req, res)=> {
    const {code} = req.body

    try {
        const user = await User.findOne({
            VerificationToken: code,
            VerificationTokenExpiresAt: {$gt: Date.now()}
        })

        if(!user){
            return res.status(400).json({success: false, message: 'Invalid or Expired Code'})
        }

        user.isVerified = true
        user.VerificationToken = undefined
        user.VerificationTokenExpiresAt = undefined

        await user.save()

        await sendWelcomeEmail(user.email, user.name)

        res.status(200).json({
            sucess:true,
            message: 'Email Verified Sucessfully',
            user: {
                ...user._doc,
                password: undefined
            }
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({success: false, message: 'Server Error'})
    }
}

export const logIn = async (req, res) => {
    const {email, password} = req.body
    try {
        const user = await User.findOne({email})
        if(!user) {
            return res.status(400).json({sucess: false, message: 'Invalid Credentials'})
        }

        const isPasswordValid = await bcryptjs.compare(password, user.password)

        if(!isPasswordValid){
            return res.status(400).json({sucess: false, message:'Invalid Password'})
        }

        generateTokenAndSetCookie(res, user._id)

        user.lastlogin = new Date()
        
        await user.save()

        res.status(200).json({
            success: true,
            message: 'Logged In Successfully',
            user: {
                ...user._doc, password:undefined
            }
        })
    } catch (error) {
        console.log('Error Signing In',error)
        res.status(400).json({success:false, message:error.message})
    }
}

export const logOut = async (req, res) => {
    res.clearCookie('token')
    res.status(200).json({success: true, message: 'Logged Out Sucessfully'})
}

export const forgotPassword = async (req, res) => {
    const {email} = req.body
    try {
        const user = await User.findOne({email})
        if(!user){
            return res.status(400).json({
                success: false,
                message: 'Email not found'
            })
        }

        const resetToken = crypto.randomBytes(20).toString('hex')
        const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000

        user.resetPasswordToken = resetToken
        user.resetPasswordExpiresAt = resetTokenExpiresAt

        await user.save()

        sendPasswordResetEmail(user.email, `${process.env.CLIENT_URL}/reset-password/${resetToken}`)

        res.status(200).json({success: true, message:'Password Reset Link Sent To Your Email'})

    } catch (error) {
        console.log('Error in forgot-password:',error)
        res.status(400).json({success: false, message:error.message})
    }
}

export const resetPassword = async (req, res)=> {
    try {
        const {token} = req.params
        const {password} = req.body

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpiresAt: {$gt: Date.now()}
        })

        if(!user){
            return res.status(400).json({success: false, message: 'Invalid or Expired Reset Token'})
        }

        const hashedPassword = await bcryptjs.hash(password, 10)

        user.password = hashedPassword
        user.resetPasswordToken = undefined
        user.resetPasswordExpiresAt = undefined

        await user.save()

        sendResetSuccessEmail(user.email)

        res.status(200).json({success: true, message: 'Password Reset Sucessful'})
    } catch (error) {
        console.log('Error in reset-password',error)
        res.status(400).json({success:false, message: error.message})
    }
}

export const checkAuth = async (req, res)=>{
    try {
        const user = await User.findById(req.userId)

        if(!user) {
            return res.status(400).json({success: false, message: 'User Not Found'})
        }
        res.status(200).json({success: true, user: {
            ...user._doc,
            password: undefined
        }})
    } catch (error) {
        console.log("Error in checkAuth",error)
        res.status(500).json({success: false, message: error.message})
    }
}