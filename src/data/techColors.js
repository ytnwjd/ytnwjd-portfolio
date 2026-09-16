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
  reactjs: { color: '#61DAFB', light: true },
  kubernetes: { color: '#326CE5' },
  mui: { color: '#007FFF' },
  c: { color: '#A8B9CC', light: true },
  raspberrypi: { color: '#A22846' },
  streamlit: { color: '#FF4B4B' },
  sqlite: { color: '#003B57' },
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
