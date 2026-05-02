# Dev Handoff Notifier — Figma Plugin

디자인 핸드오프 시 선택한 프레임 정보를 **Slack**에 자동 알림으로 보내는 Figma 플러그인입니다.

## 다운로드 및 설치

1. [**dev-handoff-notifier-plugin.zip**](./dev-handoff-notifier-plugin.zip) 다운로드 후 압축 해제
2. Figma 데스크톱 앱 → **Plugins** → **Development** → **Import plugin from manifest...**
3. 압축 해제한 폴더의 `manifest.json` 선택
4. 플러그인 목록에서 **Dev Handoff Notifier** 실행

> GitHub에서 zip 파일을 클릭한 뒤 **Download raw file** 버튼을 눌러주세요.

## 주요 기능

| 기능 | 설명 |
|------|------|
| 다중 채널 전송 | 여러 Slack 채널에 동시 알림 전송 |
| Thread 후속 알림 | 같은 프레임 재전송 시 기존 Thread에 답글 |
| 상태 마킹 | Dev Ready / Review Needed / In Progress / Updated |
| 우선순위 | 보통 / 높음 / 긴급 |
| Figma 링크 | 프레임별 Figma 바로가기 링크 포함 |
| Jira 연동 | Jira 티켓 URL 첨부 (선택) |
| 히스토리 | 프레임별 최근 10건 핸드오프 이력 조회 |
| Slack Block Kit | 구조화된 Slack 메시지 포맷 |

## 사용 방법

### 1. Slack Incoming Webhook 설정

1. [Slack API - Incoming Webhooks](https://api.slack.com/messaging/webhooks) 접속
2. **Create New App** → From Scratch → 워크스페이스 선택
3. **Incoming Webhooks** 활성화 → **Add New Webhook to Workspace** → 채널 선택
4. 생성된 Webhook URL 복사

### 2. 플러그인 설정

1. 플러그인 상단 **Slack 채널 설정** 클릭
2. 채널 이름과 Webhook URL 입력 → **추가** (여러 채널 등록 가능)
3. Figma 파일 URL 입력 (Slack 메시지에 프레임별 링크 포함용)

### 3. 알림 보내기

1. Figma에서 핸드오프할 **프레임 선택** (Frame, Component, Section, Group)
2. 담당 디자이너, 상태, 우선순위 설정
3. Jira 티켓 URL, 메모 입력 (선택)
4. **Slack에 알림 보내기** 클릭

## 파일 구조

```
figma-dev-handoff/
├── manifest.json                      # Figma 플러그인 매니페스트
├── code.js                            # 플러그인 로직 (Figma Sandbox)
├── ui.html                            # 플러그인 UI
├── dev-handoff-notifier-plugin.zip    # 배포용 압축 파일
└── README.md
```

## 참고사항

- **네트워크 접근**: `hooks.slack.com`, `slack.com` 도메인만 허용됩니다.
- **데이터 저장**: 채널 설정, 디자이너 이름, Figma URL은 `figma.clientStorage`에 저장되며 플러그인 재시작 후에도 유지됩니다.
- **로컬 개발 전용**: 팀 공유 시 각자 로컬에서 import 필요. 조직 전체 배포는 Figma Organization Plan에서 가능합니다.

## 라이선스

MIT
