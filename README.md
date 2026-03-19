# Dev Handoff Notifier — Figma Plugin

선택한 프레임을 **Dev Ready**로 마킹하고, **Slack**에 자동 알림을 보내는 Figma 플러그인입니다.

## 파일 구조

```
figma-dev-handoff/
├── manifest.json    # Figma 플러그인 설정 파일
├── code.js          # 플러그인 메인 로직 (Sandbox)
├── ui.html          # 플러그인 UI (Slack 발송 포함)
└── README.md        # 이 문서
```

## 빠른 시작

### 1. Slack Incoming Webhook 만들기

1. [Slack API - Incoming Webhooks](https://api.slack.com/messaging/webhooks) 접속
2. **Create New App** → From Scratch → 워크스페이스 선택
3. 좌측 메뉴 **Incoming Webhooks** → 활성화
4. **Add New Webhook to Workspace** → 채널 선택 (예: `#dev-handoff`)
5. 생성된 Webhook URL 복사: `https://hooks.slack.com/services/T.../B.../...`

### 2. Figma에 플러그인 설치 (로컬 개발)

1. Figma 데스크톱 앱 실행
2. 아무 파일 열기
3. 메뉴: **Plugins** → **Development** → **Import plugin from manifest...**
4. 이 폴더의 `manifest.json` 선택
5. 플러그인 목록에 **Dev Handoff Notifier** 등장!

### 3. 사용하기

1. 플러그인 실행: **Plugins** → **Development** → **Dev Handoff Notifier**
2. Slack Webhook 설정 → URL 붙여넣기 → 저장
3. 핸드오프할 **프레임 선택**
4. 담당 디자이너 이름, 상태, 메모 입력
5. **Slack에 알림 보내기** 클릭!

## 기능

| 기능 | 설명 |
|------|------|
| 프레임 자동 감지 | 선택한 프레임의 이름, 타입, 크기, 페이지 자동 추출 |
| 다중 프레임 지원 | 여러 프레임을 한 번에 선택해서 알림 가능 |
| 상태 선택 | Dev Ready / Review Needed / In Progress / Updated |
| Figma 링크 자동 생성 | 각 프레임의 직접 링크 포함 |
| Dev Ready 마킹 | 플러그인 데이터로 노드에 상태 저장 |
| Slack Block Kit | 깔끔한 포맷의 Slack 메시지 |

## 참고사항

- **네트워크 접근**: `manifest.json`의 `networkAccess`에 `hooks.slack.com`만 허용되어 있습니다. 다른 도메인이 필요하면 추가해주세요.
- **로컬 개발 전용**: 이 상태로는 팀 내 공유 시 각자 로컬에서 import 해야 합니다. 팀 전체 배포는 Figma Organization Plan에서 가능합니다.
- **Webhook URL 보안**: URL은 브라우저 localStorage에 저장됩니다. 민감 정보이므로 팀 외부 공유에 주의하세요.
