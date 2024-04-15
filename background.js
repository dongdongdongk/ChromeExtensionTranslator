//background.js

// 로컬 스토리지에서 번역 데이터를 가져오는 비동기 함수입니다.
async function getTranslations() {
  // 'translations' 키로 저장된 번역 데이터를 로컬 스토리지에서 가져옵니다.
  let { translations } = await chrome.storage.local.get("translations");
  // 가져온 데이터가 없다면 빈 배열을 반환합니다.
  translations = translations || [];
  return { translations };
}

// 로컬 스토리지에 번역 데이터를 추가하는 비동기 함수입니다.
async function addTranslation(originalText, translatedText) {
  // 기존에 저장된 번역 데이터를 가져옵니다.
  let { translations } = await chrome.storage.local.get("translations");
  translations = translations || [];

  // 이미 같은 번역 데이터가 있는지 확인합니다.
  const exists = translations.some(
    (translation) =>
      translation.originalText === originalText &&
      translation.translatedText === translatedText
  );

  // 이미 존재한다면, 성공하지 않았다는 메시지를 반환합니다.
  if (exists) {
    return { success: false, message: "이미 단어가 존재합니다." };
  }

  // 새로운 번역 데이터를 배열에 추가합니다.
  translations.push({ originalText, translatedText });
  // 업데이트된 배열을 로컬 스토리지에 저장합니다.
  await chrome.storage.local.set({ translations: translations });
  return { success: true, message: "단어가 추가되었습니다." };
}

// 확장 프로그램이나 웹 페이지로부터 메시지를 받았을 때 처리하는 리스너를 등록합니다.
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  // 요청된 작업이 'getTranslations'이면, 번역 데이터를 가져와서 응답합니다.
  if (request.action === "getTranslations") {
    getTranslations().then((translations) => {
      sendResponse(translations);
    });
    return true; // 비동기 응답을 위해 true를 반환합니다.
    // 요청된 작업이 'addTranslation'이면, 새로운 번역 데이터를 추가하고 결과를 응답합니다.
  } else if (request.action === "addTranslation") {
    addTranslation(request.originalText, request.translatedText).then(
      (response) => {
        sendResponse(response);
      }
    );
    return true; // 비동기 응답을 위해 true를 반환합니다.
  }
});

// 탭이 업데이트될 때마다 콘텐츠 스크립트를 해당 탭에 주입하는 함수입니다.
function injectContentScript(tabId) {
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    files: ["content.js"],
  });
}

// 탭의 로딩이 완료되고 활성화될 때 콘텐츠 스크립트를 주입하기 위한 리스너를 등록합니다.
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.status === "complete" && tab.active) {
    injectContentScript(tabId);
  }
});

// 1분 후에 test-popup.html을 열도록 타이머 설정
// setTimeout(openTestPopup, 10000); // 1분 후에 test-popup.html 열기

function openTestPopup() {
    // 팝업 창의 너비와 높이
    const popupWidth = 800;
    const popupHeight = 800;

    // 현재 활성화된 창의 정보를 얻어온 후 팝업의 위치 계산
    chrome.windows.getCurrent(function(currentWindow) {
        // 현재 활성화된 창의 중앙에 팝업을 위치시키기 위한 계산
        const left = Math.round((currentWindow.width - popupWidth) / 2 + currentWindow.left);
        const top = Math.round((currentWindow.height - popupHeight) / 2 + currentWindow.top);

        // 팝업을 엽니다.
        chrome.windows.create({
            url: "test-popup.html",
            type: "popup",
            width: popupWidth,
            height: popupHeight,
            left: left,
            top: top
        });
    });
}
  