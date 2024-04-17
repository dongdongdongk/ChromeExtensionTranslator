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

// chrome.alarms.create("modalPopupAlarm", { periodInMinutes: 1 / 6 });

// 시험 시작 알람
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "modalPopupAlarm") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: "showModal" });
    });
  }
});

// 시험 멈추기
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === "stopAlarm") {
    chrome.alarms.clear("modalPopupAlarm", function (wasCleared) {
      if (wasCleared) {
        // delayInMinutes 값을 chrome.storage에서 삭제
        chrome.storage.local.remove('delayInMinutes', function() {
          console.log('delayInMinutes 설정이 삭제되었습니다.');
        });
      } else {
        console.log("알람 중단에 실패했습니다.");
      }
    });
  }
});

// 시험 재시작 하기
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.action === "retryTestAlarm") {
    const delay = parseInt(message.delay, 10); // 문자열을 정수로 변환, 10진법으로 변환

    // delay 값을 분 단위로 변환하여 알람 생성
    // delay가 문자열로 전달되어 이를 분 단위로 파싱합니다. 
    // parseInt로 10진수 정수로 변환한 뒤, delayInMinutes 변수에 저장합니다.
    const delayInMinutes = delay;

    // chrome.alarms.create를 사용하여 알람을 설정합니다.
    // 첫 번째 매개변수는 알람 이름입니다. 여기서는 재사용성을 위해 알람 이름을 동적으로 생성하였습니다.
    // 두 번째 매개변수에는 when 옵션을 사용하여 현재 시간으로부터 delayInMinutes 분 후를 알람 시간으로 설정합니다.
    chrome.alarms.create("startTestAlarm", { delayInMinutes: delayInMinutes });
    // 응답을 보냅니다. 여기서는 특별한 데이터를 보낼 필요가 없으므로 빈 객체를 전달합니다.
    sendResponse({});
  }
});

// 알람 리스너 설정
// chrome.alarms.onAlarm.addListener를 사용하여 알람이 울릴 때 실행될 콜백 함수를 정의합니다.
// 이 콜백 함수는 알람 정보를 매개변수로 받습니다.
chrome.alarms.onAlarm.addListener((alarm) => {
  // 알람 이름이 "startTestAlarm"인 경우에만 아래 로직을 실행합니다.
  // 이 조건을 통해 다른 알람에 의한 실행을 방지합니다.
  if (alarm.name === "startTestAlarm") {
    // 현재 활성화된 탭을 조회합니다. { active: true, currentWindow: true } 옵션을 사용하여 현재 창의 활성 탭을 찾습니다.
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      // 찾은 탭에 메시지를 보냅니다. 여기서는 "showModal" 액션을 전달하여 모달을 표시하도록 합니다.
      chrome.tabs.sendMessage(tabs[0].id, { action: "showModal" });
    });
  }
});