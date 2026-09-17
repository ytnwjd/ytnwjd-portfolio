// scripts/generate-resume-pdf.js
//
// 빌드된 dist/를 vite preview로 잠깐 띄운 뒤, Puppeteer로 /resume 페이지를 열어
// dist/resume.pdf로 저장한다. GitHub Actions 배포 워크플로우에서
// `npm run build` 이후, Pages 아티팩트 업로드 이전에 실행된다.
//
// 페이지 크기·여백은 ResumeView.vue의 `@page` CSS를 그대로 따른다(preferCSSPageSize).
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { preview } from 'vite'
import puppeteer from 'puppeteer'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const outputPath = path.join(root, 'dist', 'resume.pdf')

async function main() {
  const server = await preview({
    root,
    preview: { port: 4173, strictPort: false },
    logLevel: 'error',
  })

  const baseUrl = server.resolvedUrls.local[0]
  const resumeUrl = new URL('resume', baseUrl).toString()

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  try {
    const page = await browser.newPage()
    await page.goto(resumeUrl, { waitUntil: 'networkidle0' })
    await page.waitForSelector('.resume-page')
    await page.emulateMediaType('print')
    await page.pdf({
      path: outputPath,
      printBackground: true,
      preferCSSPageSize: true,
    })
    console.log(`resume.pdf generated at ${outputPath}`)
  } finally {
    await browser.close()
    await new Promise((resolve, reject) => {
      server.httpServer.close((err) => (err ? reject(err) : resolve()))
    })
  }
}

main().catch((err) => {
  console.error('[generate-resume-pdf] failed:', err)
  process.exit(1)
})
