// src/utils/asset.js
// public/ 아래 파일 경로('images/...')를 배포 base URL 기준 절대 경로로 바꾼다
export function publicAsset(path) {
  return `${import.meta.env.BASE_URL}${path}`
}
