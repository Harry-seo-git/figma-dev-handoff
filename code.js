// Dev Handoff Notifier — Figma Plugin (Sandbox)
// 이 파일은 Figma 샌드박스에서 실행됩니다.

figma.showUI(__html__, { width: 520, height: 720 });

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
      const existingStatus = node.getPluginData("devHandoffStatus") || null;
      const existingDesigner = node.getPluginData("devHandoffDesigner") || null;
      const existingTimestamp = node.getPluginData("devHandoffTimestamp") || null;

      // Thread ts 정보 (채널별)
      let threadMap = {};
      try {
        const raw = node.getPluginData("devHandoffThreads");
        if (raw) threadMap = JSON.parse(raw);
      } catch (e) {}

      // 부모 프레임 경로
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
        prevStatus: existingStatus,
        prevDesigner: existingDesigner,
        prevTimestamp: existingTimestamp,
        threadMap: threadMap
      };
    });

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

figma.on("selectionchange", () => {
  sendSelectionToUI();
});

if (figma.command === "open") {
  sendSelectionToUI();
}

// UI에서 오는 메시지 처리
figma.ui.onmessage = (msg) => {
  // UI 로드 완료 시 현재 선택 정보 전달
  if (msg.type === "ui-ready") {
    sendSelectionToUI();
    return;
  }

  if (msg.type === "mark-dev-ready") {
    const selection = figma.currentPage.selection;
    const targetNodes = selection.filter(node => HANDOFF_TYPES.includes(node.type));

    for (const node of targetNodes) {
      node.setPluginData("devHandoffStatus", msg.status);
      node.setPluginData("devHandoffDesigner", msg.designer);
      node.setPluginData("devHandoffTimestamp", new Date().toISOString());
      node.setPluginData("devHandoffMemo", msg.memo || "");

      // 히스토리 (최근 10건)
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

      node.setRelaunchData({ open: `${msg.status} — ${msg.designer}` });
    }

    sendSelectionToUI();

    const statusLabel = {
      "dev-ready": "Dev Ready",
      "review-needed": "Review Needed",
      "in-progress": "In Progress",
      "updated": "Updated"
    }[msg.status] || msg.status;

    figma.notify(`${targetNodes.length}개 프레임 → "${statusLabel}" 마킹 완료`);
  }

  // Thread ts 저장 — Slack Web API 응답에서 받은 ts를 노드에 저장
  if (msg.type === "save-thread-ts") {
    const node = figma.getNodeById(msg.nodeId);
    if (node) {
      let threadMap = {};
      try {
        const raw = node.getPluginData("devHandoffThreads");
        if (raw) threadMap = JSON.parse(raw);
      } catch (e) {}
      threadMap[msg.channelId] = msg.ts;
      node.setPluginData("devHandoffThreads", JSON.stringify(threadMap));
    }
  }

  if (msg.type === "get-history") {
    const node = figma.getNodeById(msg.nodeId);
    if (node) {
      const historyRaw = node.getPluginData("devHandoffHistory") || "[]";
      let history = [];
      try { history = JSON.parse(historyRaw); } catch (e) { history = []; }
      figma.ui.postMessage({ type: "history-data", nodeId: msg.nodeId, nodeName: node.name, history: history });
    }
  }

  if (msg.type === "clear-status") {
    const node = figma.getNodeById(msg.nodeId);
    if (node) {
      node.setPluginData("devHandoffStatus", "");
      node.setPluginData("devHandoffDesigner", "");
      node.setPluginData("devHandoffTimestamp", "");
      node.setPluginData("devHandoffMemo", "");
      node.setPluginData("devHandoffThreads", "");
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
