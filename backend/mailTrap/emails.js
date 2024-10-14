import { sender, transport } from "./mailTrapConfig.js"
import { PASSWORD_RESET_REQUEST_TEMPLATE, 
        PASSWORD_RESET_SUCCESS_TEMPLATE, 
        VERIFICATION_EMAIL_TEMPLATE, 
        VERIFICATION_SUCCESS_TEMPLATE } from "./emailTemplates.js"

export const sendVerificationEmail = async (email, VerificationToken)=>{
    const recipient = [email]
    try {
       const response = await transport.sendMail({
        from: sender,
        to: recipient,
        subject: "Verify Your Email",
        html: VERIFICATION_EMAIL_TEMPLATE.replace('verificationCode', VerificationToken),
        category:"Email Verification"
       }) 

       console.log('Email Sent Successfully', response)
    } catch (error) {
        console.error(`Error sending Verification ${error}`)
        throw new Error (`Error Sending Verification Email: ${error}`)
    }
}

export const sendWelcomeEmail = async (email, name)=>{
    const recipient = [email]
    try {
       const response = await transport.sendMail({
        from: sender,
        to: recipient,
        subject: "Welcome To Auth",
        html: VERIFICATION_SUCCESS_TEMPLATE.replace('recipientName', name),
        category:"Welcome Email"
       }) 

       console.log('Welcome Email Sent Successfully', response)
    } catch (error) {
        console.error(`Error sending Verification: ${error}`)
        throw new Error (`Error Sending Verification Email: ${error}`)
    }
}
export const sendPasswordResetEmail = async (email, RpUrl)=>{
    const recipient = [email]
    try {
       const response = await transport.sendMail({
        from: sender,
        to: recipient,
        subject: "Auth Password Reset",
        html: PASSWORD_RESET_REQUEST_TEMPLATE.replace('resetURL', RpUrl),
        category:"Reset Password Email"
       }) 

       console.log('Password Reset Token Sent Successfully', response)
    } catch (error) {
        console.error(`Error sending Token: ${error}`)
        throw new Error (`Error Sending Token Email: ${error}`)
    }
}
export const sendResetSuccessEmail = async (email)=>{
    const recipient = [email]
    try {
       const response = await transport.sendMail({
        from: sender,
        to: recipient,
        subject: "Auth Password Successful Reset",
        html: PASSWORD_RESET_SUCCESS_TEMPLATE,
        category:"Reset Password Success Email"
       }) 

       console.log('Password Reset Successfully', response)
    } catch (error) {
        console.error(`Error reseting password: ${error}`)
        throw new Error (`Error reseting password: ${error}`)
    }
}