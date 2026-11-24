// src/utils/text.js
// projects.js의 responsibilities / result 문장 규칙 — "헤드라인 — 설명"(em dash, 앞뒤 공백)이면
// 앞부분(30자 이내)을 굵은 헤드라인으로 쓴다. 상세 페이지와 이력서가 같은 규칙을 공유한다.
export function splitHeadline(text) {
  const match = text.match(/^(.{1,30}?)\s+—\s+(.+)$/)
  return match ? { headline: match[1], rest: match[2] } : { headline: null, rest: text }
}
