import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import axios from 'axios'
import jwt from 'jsonwebtoken'
import type { PayloadHandler } from 'payload'
import { authMe } from './endpoints/authMe'

import { Members } from './collections/Members'
import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { ProductUnits } from './collections/ProductUnits'
import { ProductCategories } from './collections/ProductCategories'
import { Products } from './collections/Products'
import { Permissions } from './collections/Permissions'
import { Customers } from './collections/Customers'
import { Receipts } from "./collections/Receipts"
import { ReceiptItems } from "./collections/ReceiptItems"

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
    admin: {
        user: Users.slug,
        importMap: { baseDir: path.resolve(dirname) },
    },

    collections: [
        Users,
        Media,
        Members,
        ProductUnits,
        ProductCategories,
        Products,
        Permissions,
        Customers,
        Receipts,
        ReceiptItems,
    ],

    editor: lexicalEditor(),

    secret: process.env.PAYLOAD_SECRET || '',

    typescript: {
        outputFile: path.resolve(dirname, 'payload-types.ts'),
    },

    db: postgresAdapter({
        pool: {
            connectionString: process.env.DATABASE_URL || '',
        },
    }),

    sharp,

    cors: [
        'https://portal.anbardaranrey.ir',
        'http://portal.anbardaranrey.ir',
        'http://localhost:5173',
        'http://localhost:3000',
        'http://localhost:5001',
        '*',
    ],

    csrf: [
        'https://portal.anbardaranrey.ir',
        'http://portal.anbardaranrey.ir',
        'http://localhost:5173',
        'http://localhost:3000',
        'http://localhost:5001',
    ],

    endpoints: [
        // --------------------------------------------
        // 🔹 REQUEST OTP
        // --------------------------------------------
        {
            path: '/auth/request-otp',
            method: 'post',
            handler: (async (req) => {
                try {
                    const body = await (req as Request).json()
                    const phone = body?.mobile

                    if (!phone) {
                        return Response.json(
                            { error: 'شماره تلفن الزامی است' },
                            { status: 400 }
                        )
                    }

                    const pl = req.payload

                    const members = await pl.find({
                        collection: 'members',
                        where: { mobile: { equals: phone } },
                        limit: 1,
                    })

                    if (!members?.docs?.length) {
                        return Response.json({ error: 'عضو یافت نشد' }, { status: 404 })
                    }

                    const member = members.docs[0]

                    const otp = Math.floor(100000 + Math.random() * 900000).toString()
                    const expires = new Date(Date.now() + 2 * 60 * 1000).toISOString()

                    await pl.update({
                        collection: 'members',
                        id: member.id,
                        data: {
                            otp_code: otp,
                            otp_expires: expires,
                        },
                    })

                    // ارسال OTP
                    try {
                        await axios.post(
                            'https://rest.payamak-panel.com/api/SendSMS/SendSMS',
                            {
                                username: process.env.MELIPAYAMAK_USERNAME,
                                password: process.env.MELIPAYAMAK_PASSWORD,
                                to: phone,
                                from: process.env.SMS_SENDER_NUMBER,
                                text: `کد ورود شما: ${otp}\nاتحادیه انبارداران ری`,
                                isflash: false,
                            }
                        )
                    } catch (_) {
                        // پیامک fail مهم نیست
                    }

                    return Response.json(
                        { success: true, message: 'کد ورود ارسال شد' },
                        { status: 200 }
                    )
                } catch (_) {
                    return Response.json(
                        { error: 'خطای داخلی سرور' },
                        { status: 500 }
                    )
                }
            }) as PayloadHandler,
        },

        // --------------------------------------------
        // 🔹 VERIFY OTP
        // --------------------------------------------
        {
            path: '/auth/verify-otp',
            method: 'post',
            handler: (async (req) => {
                try {
                    const body = await (req as Request).json()
                    const phone = body?.mobile
                    const otp = body?.otp

                    if (!phone || !otp) {
                        return Response.json(
                            { error: 'شماره و کد الزامی است' },
                            { status: 400 }
                        )
                    }

                    const pl = req.payload

                    const members = await pl.find({
                        collection: 'members',
                        where: {
                            mobile: { equals: phone },
                            otp_code: { equals: otp },
                        },
                        limit: 1,
                    })

                    if (!members?.docs?.length) {
                        return Response.json(
                            { error: 'کد وارد شده اشتباه است' },
                            { status: 400 }
                        )
                    }

                    const member = members.docs[0]

                    if (!member.otp_expires || new Date() > new Date(member.otp_expires)) {
                        return Response.json(
                            { error: 'کد منقضی شده است' },
                            { status: 400 }
                        )
                    }

                    // پاک کردن OTP
                    await pl.update({
                        collection: 'members',
                        id: member.id,
                        data: { otp_code: null, otp_expires: null },
                    })

                    // ساخت JWT
                    const token = jwt.sign(
                        {
                            id: member.id,
                            collection: 'members',
                            role: member.role || 'union_member',
                        },
                        process.env.PAYLOAD_SECRET!,
                        { expiresIn: '24h' }
                    )

                    // حذف مقادیر حساس
                    const {
                        otp_code: _otp,
                        otp_expires: _exp,
                        ...clean
                    } = member

                    return Response.json(
                        { success: true, token, user: clean },
                        { status: 200 }
                    )
                } catch (_) {
                    return Response.json(
                        { error: 'خطای داخلی سرور' },
                        { status: 500 }
                    )
                }
            }) as PayloadHandler,
        },

        // --------------------------------------------
        // 🔹 GET MEMBER BY ID (Protected)
        // --------------------------------------------
        {
            path: '/members/:id',
            method: 'get',
            handler: (async (req) => {
                try {
                    const authHeader = (req as Request).headers.get('authorization')

                    if (!authHeader?.startsWith('Bearer ')) {
                        return Response.json({ error: 'Unauthorized' }, { status: 401 })
                    }

                    const token = authHeader.substring(7)

                    let decoded: any
                    try {
                        decoded = jwt.verify(token, process.env.PAYLOAD_SECRET!)
                    } catch {
                        return Response.json(
                            { error: 'Invalid or expired token' },
                            { status: 401 }
                        )
                    }

                    const url = new URL((req as Request).url)
                    const parts = url.pathname.split('/')
                    const memberId = parts[parts.length - 1]

                    if (!memberId) {
                        return Response.json(
                            { error: 'Member ID required' },
                            { status: 400 }
                        )
                    }

                    if (decoded.id !== Number(memberId)) {
                        return Response.json(
                            { error: 'Forbidden' },
                            { status: 403 }
                        )
                    }

                    const pl = req.payload

                    const member = await pl.findByID({
                        collection: 'members',
                        id: memberId,
                    })

                    if (!member) {
                        return Response.json(
                            { error: 'Member not found' },
                            { status: 404 }
                        )
                    }

                    const {
                        otp_code: _otp2,
                        otp_expires: _exp2,
                        ...clean
                    } = member

                    return Response.json(clean, { status: 200 })
                } catch (_) {
                    return Response.json(
                        { error: 'خطای داخلی سرور' },
                        { status: 500 }
                    )
                }
            }) as PayloadHandler,
        },

        // --------------------------------------------
        // 🔹 AUTH ME (ADMIN + MEMBER)
        // --------------------------------------------
        authMe,
    ],
})
