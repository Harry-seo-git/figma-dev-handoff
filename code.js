// Dev Handoff Notifier — Figma Plugin (Sandbox)
// 이 파일은 Figma 샌드박스에서 실행됩니다.

figma.showUI(__html__, { width: 480, height: 620 });

// 선택 변경 시 UI에 프레임 정보 전달
function sendSelectionToUI() {
  const selection = figma.currentPage.selection;
  const fileKey = figma.fileKey;
  const pageName = figma.currentPage.name;

  const frames = selection.map(node => ({
    id: node.id,
    name: node.name,
    type: node.type,
    width: Math.round(node.width),
    height: Math.round(node.height),
    pageName: pageName,
    figmaLink: fileKey
      ? `https://www.figma.com/file/${fileKey}?node-id=${encodeURIComponent(node.id)}`
      : null
  }));

  figma.ui.postMessage({
    type: "selection-update",
    frames: frames,
    pageName: pageName
  });
}

// 초기 선택 정보 전달
sendSelectionToUI();

// 선택 변경 이벤트 리스너
figma.on("selectionchange", () => {
  sendSelectionToUI();
});

// UI에서 오는 메시지 처리
figma.ui.onmessage = (msg) => {
  if (msg.type === "mark-dev-ready") {
    // 선택된 노드에 Dev Ready 상태 저장
    const selection = figma.currentPage.selection;
    for (const node of selection) {
      node.setPluginData("devHandoffStatus", msg.status);
      node.setPluginData("devHandoffDesigner", msg.designer);
      node.setPluginData("devHandoffTimestamp", new Date().toISOString());
      if (msg.memo) {
        node.setPluginData("devHandoffMemo", msg.memo);
      }
    }

    figma.notify(`${selection.length}개 프레임이 "${msg.status}"로 마킹되었습니다.`);
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
