// Dev Handoff Notifier — Figma Plugin (Sandbox)
// 이 파일은 Figma 샌드박스에서 실행됩니다.

figma.showUI(__html__, { width: 500, height: 680 });

// 핸드오프 대상 노드 타입
const HANDOFF_TYPES = ["FRAME", "COMPONENT", "COMPONENT_SET", "SECTION", "GROUP"];

// 선택 변경 시 UI에 프레임 정보 전달
function sendSelectionToUI() {
  const selection = figma.currentPage.selection;
  const fileKey = figma.fileKey;
  const pageName = figma.currentPage.name;

  const frames = selection
    .filter(node => HANDOFF_TYPES.includes(node.type))
    .map(node => {
      // 기존 pluginData 읽기
      const existingStatus = node.getPluginData("devHandoffStatus") || null;
      const existingDesigner = node.getPluginData("devHandoffDesigner") || null;
      const existingTimestamp = node.getPluginData("devHandoffTimestamp") || null;

      // 부모 프레임 경로 구하기 (최상위까지)
      const path = [];
      let parent = node.parent;
      while (parent && parent.type !== "PAGE") {
        path.unshift(parent.name);
        parent = parent.parent;
      }

      return {
        id: node.id,
        name: node.name,
        type: node.type,
        width: Math.round(node.width),
        height: Math.round(node.height),
        parentPath: path.join(" / "),
        pageName: pageName,
        figmaLink: fileKey
          ? `https://www.figma.com/file/${fileKey}?node-id=${encodeURIComponent(node.id)}`
          : null,
        // 기존 핸드오프 상태
        prevStatus: existingStatus,
        prevDesigner: existingDesigner,
        prevTimestamp: existingTimestamp
      };
    });

  // 핸드오프 대상이 아닌 노드 수
  const skippedCount = selection.length - frames.length;

  figma.ui.postMessage({
    type: "selection-update",
    frames: frames,
    pageName: pageName,
    skippedCount: skippedCount
  });
}

// 초기 선택 정보 전달
sendSelectionToUI();

// 선택 변경 이벤트 리스너
figma.on("selectionchange", () => {
  sendSelectionToUI();
});

// relaunch 버튼으로 열린 경우
if (figma.command === "open") {
  sendSelectionToUI();
}

// UI에서 오는 메시지 처리
figma.ui.onmessage = (msg) => {
  if (msg.type === "mark-dev-ready") {
    const selection = figma.currentPage.selection;
    const targetNodes = selection.filter(node => HANDOFF_TYPES.includes(node.type));

    for (const node of targetNodes) {
      node.setPluginData("devHandoffStatus", msg.status);
      node.setPluginData("devHandoffDesigner", msg.designer);
      node.setPluginData("devHandoffTimestamp", new Date().toISOString());
      node.setPluginData("devHandoffMemo", msg.memo || "");

      // 핸드오프 히스토리 추가 (최근 10건)
      const historyRaw = node.getPluginData("devHandoffHistory") || "[]";
      let history = [];
      try { history = JSON.parse(historyRaw); } catch (e) { history = []; }
      history.unshift({
        status: msg.status,
        designer: msg.designer,
        memo: msg.memo || "",
        timestamp: new Date().toISOString()
      });
      if (history.length > 10) history = history.slice(0, 10);
      node.setPluginData("devHandoffHistory", JSON.stringify(history));

      // relaunch 버튼 등록 — 마킹된 노드에서 바로 플러그인 열기
      node.setRelaunchData({ open: `${msg.status} — ${msg.designer}` });
    }

    // 마킹 후 UI에 갱신된 정보 전달
    sendSelectionToUI();

    const statusLabel = {
      "dev-ready": "Dev Ready",
      "review-needed": "Review Needed",
      "in-progress": "In Progress",
      "updated": "Updated"
    }[msg.status] || msg.status;

    figma.notify(`${targetNodes.length}개 프레임 → "${statusLabel}" 마킹 완료`);
  }

  if (msg.type === "get-history") {
    // 특정 노드의 핸드오프 히스토리 조회
    const node = figma.getNodeById(msg.nodeId);
    if (node) {
      const historyRaw = node.getPluginData("devHandoffHistory") || "[]";
      let history = [];
      try { history = JSON.parse(historyRaw); } catch (e) { history = []; }
      figma.ui.postMessage({ type: "history-data", nodeId: msg.nodeId, nodeName: node.name, history: history });
    }
  }

  if (msg.type === "clear-status") {
    // 특정 노드의 핸드오프 상태 초기화
    const node = figma.getNodeById(msg.nodeId);
    if (node) {
      node.setPluginData("devHandoffStatus", "");
      node.setPluginData("devHandoffDesigner", "");
      node.setPluginData("devHandoffTimestamp", "");
      node.setPluginData("devHandoffMemo", "");
      node.setRelaunchData({});
      sendSelectionToUI();
      figma.notify(`"${node.name}" 핸드오프 상태가 초기화되었습니다.`);
    }
  }

  if (msg.type === "slack-sent") {
    figma.notify("Slack 알림이 전송되었습니다!");
  }

  if (msg.type === "slack-error") {
    figma.notify("Slack 전송 실패: " + msg.error, { error: true });
  }

  if (msg.type === "close") {
    figma.closePlugin();
  }
};
