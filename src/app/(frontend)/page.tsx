import { headers as getHeaders } from 'next/headers.js'
import Image from 'next/image'
import { getPayload } from 'payload'
import React from 'react'
import { fileURLToPath } from 'url'

import config from '@/payload.config'
import './styles.css'
import MemberWelcome from './MemberWelcome'   // ⬅ اضافه شد (Client Component)

export default async function HomePage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  // 🔹 این فقط برای USERS است (ادمین Payload)
  const { user } = await payload.auth({ headers })

  const fileURL = `vscode://file/${fileURLToPath(import.meta.url)}`

  return (
      <div className="home">
        <div className="content">
          <picture>
            <source srcSet="https://raw.githubusercontent.com/payloadcms/payload/main/packages/ui/src/assets/payload-favicon.svg" />
            <Image
                alt="Payload Logo"
                height={65}
                src="https://raw.githubusercontent.com/payloadcms/payload/main/packages/ui/src/assets/payload-favicon.svg"
                width={65}
            />
          </picture>

          {/* ⭐ پیام خوش‌آمدگویی کاربر پنل Payload */}
          {!user && <h1>Welcome to your new project.</h1>}
          {user && user.collection === 'users' && (
              <h1>Welcome back, {user.email}</h1>
          )}

          {/* ⭐ خوش‌آمدگویی مخصوص Members (پرتال) */}
          <MemberWelcome />

          <div className="links">
            <a
                className="admin"
                href={payloadConfig.routes.admin}
                rel="noopener noreferrer"
                target="_blank"
            >
              Go to admin panel
            </a>
            <a
                className="docs"
                href="https://payloadcms.com/docs"
                rel="noopener noreferrer"
                target="_blank"
            >
              Documentation
            </a>
          </div>
        </div>

        <div className="footer">
          <p>Update this page by editing</p>
          <a className="codeLink" href={fileURL}>
            <code>app/(frontend)/page.tsx</code>
          </a>
        </div>
      </div>
  )
}
