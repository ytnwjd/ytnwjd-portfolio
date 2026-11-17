import { skillCategories } from './skills'

function normalize(name) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '')
}

// SKILLS 섹션에서 이미 검증된 브랜드 컬러(simpleicons.org 기준)를 그대로 재사용
const baseColors = {}
for (const cat of skillCategories) {
  for (const skill of cat.skills) {
    if (skill.color) {
      baseColors[normalize(skill.name)] = { color: skill.color, light: !!skill.light }
    }
  }
}

// projects.js의 techStack 표기가 skills.js와 다르거나(React vs React.js), SKILLS에는
// 아예 없거나 색이 지정 안 된 기술(Grafana·Prometheus는 SKILLS에서 level:'mid'라 색이 없음)을 위한 보강 항목
const extraColors = {
  react: { color: '#61DAFB', light: true },
  kubernetes: { color: '#326CE5' },
  mui: { color: '#007FFF' },
  c: { color: '#A8B9CC', light: true },
  raspberrypi: { color: '#A22846' },
  mongodb: { color: '#47A248' },
  grafana: { color: '#F46800' },
  prometheus: { color: '#E6522C' },
  slackwebhook: { color: '#4A154B' },
  kakaoworkbotapi: { color: '#4A154B' },
}

const techColorMap = { ...baseColors, ...extraColors }

// 회사/제품 브랜드가 없는 범용 기술 표기(예: TCP/IP Socket, POSIX Threads)를 위한 중립 톤
const FALLBACK_COLOR = { color: '#475569' }

export function getTechColor(name) {
  return techColorMap[normalize(name)] || FALLBACK_COLOR
}

// 밝은 배경(light: true)에는 짙은 텍스트를, 어두운 배경에는 흰 텍스트를 얹어 항상 대비를 확보한다
const DARK_TEXT = '#1a1a1a'
const LIGHT_TEXT = '#ffffff'

export function getTagTextColor(light) {
  return light ? DARK_TEXT : LIGHT_TEXT
}

// ── 연한 틴트 태그 ─────────────────────────────────────────
// 진한 브랜드 색을 배경으로 꽉 채우면 태그가 본문보다 튀므로, 브랜드 색을 흰색에 크게 섞은
// 파스텔 배경 + 같은 계열의 짙은 글자로 바꿔 "색은 알아보되 조용한" 태그를 만든다.
function hexToRgb(hex) {
  const value = hex.replace('#', '')
  const full = value.length === 3 ? [...value].map((c) => c + c).join('') : value
  const num = parseInt(full, 16)
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255]
}

// target 색 쪽으로 ratio(0~1)만큼 섞는다
function mix(rgb, target, ratio) {
  const [r, g, b] = rgb.map((c, i) => Math.round(c + (target[i] - c) * ratio))
  return `rgb(${r}, ${g}, ${b})`
}

const WHITE = [255, 255, 255]
const BLACK = [0, 0, 0]

export function getTechTintStyle(name) {
  const { color, light } = getTechColor(name)
  const rgb = hexToRgb(color)
  return {
    backgroundColor: mix(rgb, WHITE, 0.78),
    borderColor: mix(rgb, WHITE, 0.45),
    // 원래 밝은 브랜드 색(노랑·하늘색 등)은 더 많이 어둡게 해야 흰 바탕에서 읽힌다
    // 작은 글씨 기준 대비 4.5:1 이상이 나오도록 섞는 비율을 잡았다
    color: mix(rgb, BLACK, light ? 0.6 : 0.4),
  }
}
