import dotenv from 'dotenv'
import User from '../model/userSchema'
import jwt, { Secret } from 'jsonwebtoken'
import { Request, Response } from 'express'
const asyncHandler = require('express-async-handler')

dotenv.config()

export const handleRefreshToken = asyncHandler(async (req: Request, res: Response) => {
    const cookies = req.cookies
    if (!cookies?.loginCookie) return res.sendStatus(401) // unauthorized

    const refreshToken = cookies.loginCookie
    const existingUser = await User.findOne({ refreshToken }).exec()

    if (!existingUser) return res.sendStatus(403) // forbidden

    jwt.verify(
        refreshToken,
        `${process.env.SECRET_REFRESH_TOKEN}`,
        (err: any, userInfo: any) => {
            if (err || userInfo.userId !== existingUser.username) return res.sendStatus(403)
            const accessToken: Secret = jwt.sign(
                {
                    "userInfo": {
                        "userId": userInfo.userId,
                        "roles": userInfo.roles
                    }
                },
                `${process.env.SECRET_ACCESS_TOKEN}`,
                { expiresIn: '1h'}
            )
            res.status(200).json({ success: true, accessToken })
        }
    )
})