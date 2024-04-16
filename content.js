// content.js

// 마지막으로 displayTranslation이 호출된 시간을 저장하는 변수
let lastDisplayTranslationTime = 0;

// 선택된 텍스트를 번역하는 함수
function translateSelectedText() {
  // 선택된 텍스트 가져오기
  const selectedText = window.getSelection().toString().trim();
  if (selectedText !== "") {
    translateText(selectedText);
  }
  console.log("translateSelectedText 함수 호출됨");
}

// 텍스트를 번역하는 함수
function translateText(text) {
  // 'YOUR_API_KEY'를 실제 API 키로 대체
  const apiKey = "뭘봐";
  const targetLanguage = "ko"; // 대상 언어 코드로 변경

  // 번역 API에 요청 보내기
  fetch(
    `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: text,
        target: targetLanguage,
      }),
    }
  )
    .then((response) => response.json())
    .then((data) => {
      const translatedText = data.data.translations[0].translatedText;
      displayTranslation(text, translatedText); // 번역 전 텍스트와 번역 후 텍스트 모두 전달
    })
    .catch((error) => {
      console.error("에러:", error);
    });
  console.log("translateText 함수 호출됨");
}

// 선택된 텍스트 옆에 번역된 텍스트를 표시하는 함수
// 번역된 텍스트를 표시하는 함수// 마지막 번역 표시 시간을 추적하는 전역 변수

// 선택된 텍스트 옆에 번역된 텍스트를 표시하는 함수
function displayTranslation(originalText, translatedText) {
  const currentTime = new Date().getTime();

  // 마지막 호출된 시간으로부터 1초 이내에 호출되었는지 확인
  if (currentTime - lastDisplayTranslationTime < 2000) {
    return; // 1초 이내에 호출되었으면 함수 실행을 중지
  }

  lastDisplayTranslationTime = currentTime; // 현재 시간을 마지막 호출된 시간으로 설정

  const selection = window.getSelection();
  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    // 번역된 텍스트를 표시할 div 요소 생성
    const translationDiv = document.createElement("div");
    translationDiv.innerText = translatedText;
    translationDiv.classList.add("translationDiv"); // 클래스 추가
    translationDiv.style.position = "absolute";
    translationDiv.style.top = `${rect.top + window.pageYOffset}px`; // 선택된 텍스트의 상단 위치 사용
    translationDiv.style.left = `${rect.right + window.pageXOffset + 10}px`; // 선택된 텍스트 우측에 위치
    translationDiv.style.backgroundColor = "white";
    translationDiv.style.border = "1px solid black";
    translationDiv.style.padding = "5px";
    translationDiv.style.zIndex = "9999";

    // 음성 출력 이미지 요소 생성 및 스타일링
    const voiceButton = document.createElement("img");
    voiceButton.setAttribute(
      "src",
      chrome.runtime.getURL("/images/icons8-sound-48.png")
    ); // 이미지 파일 경로 설정
    voiceButton.setAttribute("alt", "음성 출력");
    voiceButton.style.cursor = "pointer"; // 커서를 포인터로 설정하여 클릭 가능함을 나타냄
    voiceButton.style.width = "28px"; // 이미지 너비 설정
    voiceButton.style.height = "28px"; // 이미지 높이 설정
    voiceButton.style.marginLeft = "8px";
    voiceButton.style.marginRight = "5px";

    // 이벤트 리스너 추가
    voiceButton.addEventListener("click", () => {
      // 음성 출력 버튼 클릭 시 음성 출력 함수 호출
      speakText(originalText);
    });

    // 버튼을 추가할 부모 요소 선택
    translationDiv.appendChild(voiceButton);

    // 추가 버튼 생성 및 스타일링
    const addButton = document.createElement("button");
    addButton.innerText = "추가";
    addButton.classList.add("btn", "btn-primary", "me-2", "ml-4"); // 부트스트랩 클래스 추가
    addButton.style.marginRight = "5px"; // 우측 마진 설정
    addButton.style.backgroundColor = "#28a745"; // 배경색 설정
    addButton.style.color = "#fff"; // 텍스트 색상 설정
    addButton.style.border = "1px solid #28a745"; // 테두리 설정
    addButton.style.borderRadius = "5px"; // 테두리 반경 설정
    addButton.addEventListener("click", () => {
      addButtonClickHandler(originalText, translatedText);
      translationDiv.remove(); // 번역된 상자를 추가한 후 즉시 제거
    });
    translationDiv.appendChild(addButton);

    // 번역된 텍스트 닫기 버튼 생성 및 스타일링
    const closeButton = document.createElement("button");
    closeButton.innerText = "닫기";
    closeButton.classList.add("btn", "btn-danger", "ml-4"); // 부트스트랩 클래스 추가
    closeButton.style.backgroundColor = "#dc3545"; // 배경색 설정
    closeButton.style.color = "#fff"; // 텍스트 색상 설정
    closeButton.style.border = "1px solid #dc3545"; // 테두리 설정
    closeButton.style.borderRadius = "5px"; // 테두리 반경 설정
    closeButton.addEventListener("click", () => {
      closeTranslationBox(translationDiv); // 닫기 버튼 클릭 시 처리 함수 호출
    });
    translationDiv.appendChild(closeButton);

    // 번역된 텍스트를 body에 추가
    document.body.appendChild(translationDiv);
  }
}
// 음성 출력 함수 (영어로 설정)
function speakText(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US"; // 언어를 영어(미국)으로 설정
  window.speechSynthesis.speak(utterance);
}

// 로컬 스토리지에 번역된 텍스트를 추가하는 함수
function addButtonClickHandler(originalText, translatedText) {
  const lowerCaseOriginalText = originalText.toLowerCase();
  const lowerCaseTranslatedText = translatedText.toLowerCase();

  chrome.runtime.sendMessage(
    {
      action: "addTranslation",
      originalText: lowerCaseOriginalText,
      translatedText: lowerCaseTranslatedText,
    },
    function (response) {
      if (response.success) {
        alert(response.message);
      } else {
        alert(response.message);
      }
    }
  );
}

// 번역된 상자를 닫는 함수
function closeTranslationBox(translationDiv) {
  translationDiv.remove(); // 번역된 상자 제거
  console.log("closeTranslationBox 함수 호출됨");
  event.stopPropagation(); // 이벤트 전파 중지
}

// 최대 허용 길이 설정 (예: 20)
const MAX_TEXT_LENGTH = 20;

// 선택된 텍스트가 영어 숙어 또는 단어인지 여부를 확인하는 함수
function isEnglishWordOrIdiom(text) {
  // 영어 알파벳과 공백만으로 구성되어 있고 공백으로 단어가 분리되어 있는지 확인
  return /^[a-zA-Z\s]+$/.test(text) && text.trim().split(/\s+/).length <= 2;
}

// 선택된 텍스트가 변경될 때마다 번역 실행
document.addEventListener("mouseup", function (event) {
  const selectedText = window.getSelection().toString().trim();
  if (
    isEnglishWordOrIdiom(selectedText) &&
    selectedText.length <= MAX_TEXT_LENGTH
  ) {
    translateSelectedText();
  } else {
    // 선택된 텍스트가 영어 숙어 또는 단어가 아니거나 길이가 너무 긴 경우, 번역된 상자 제거
    const translationDiv = document.querySelector(".translationDiv");
    if (translationDiv) {
      translationDiv.remove();
    }
  }
});

// 외부를 클릭하면 번역된 상자 제거
document.addEventListener("click", function (event) {
  const translationDiv = document.querySelector(".translationDiv");
  if (translationDiv && !translationDiv.contains(event.target)) {
    translationDiv.remove();
  }
  console.log("click 이벤트 발생");
});

// 외부 클릭 시 번역된 상자 제거 이벤트 추가
document.addEventListener("click", removeTranslationBoxOnClick);

// 추가 버튼 클릭 시 번역 호출 방지
document.addEventListener("click", function (event) {
  const addButton = document.querySelector(
    ".translationDiv button:nth-of-type(1)"
  );
  if (addButton && addButton.contains(event.target)) {
    event.stopPropagation();
  }
});

// 닫기 버튼 클릭 시 번역 호출 방지
document.addEventListener("click", function (event) {
  const closeButton = document.querySelector(
    ".translationDiv button:nth-of-type(2)"
  );
  if (closeButton && closeButton.contains(event.target)) {
    event.stopPropagation();
  }
});

// 외부 클릭 시 번역된 상자 제거 이벤트 추가
document.addEventListener("click", removeTranslationBoxOnClick);

// 외부 클릭 시 번역된 상자 제거
function removeTranslationBoxOnClick(event) {
  const translationDiv = document.querySelector(".translationDiv");
  if (translationDiv && !translationDiv.contains(event.target)) {
    translationDiv.remove();
  }
  console.log("click 이벤트 발생");
}

// content script 로드 후 번역을 위해 필요한 초기화 작업 수행
translateSelectedText();

// 1분 후에 시험을 시작하는 타이머를 설정합니다.
setTimeout(startTestFromContentScript, 60000); // 1분 후에 시험 시작

// 시험을 시작하는 함수
function startTestFromContentScript() {
  // 백그라운드 스크립트에 'getTranslations' 작업을 요청하여 저장된 번역 데이터를 가져옵니다.
  chrome.runtime.sendMessage(
    { action: "getTranslations" },
    function (response) {
      // 응답으로 받은 데이터 중 'translations'를 추출합니다.
      // 만약 'translations' 데이터가 없다면 빈 배열을 사용합니다.
      const storageData =
        response && response.translations ? response.translations : [];
      // 1분 후에 시험을 시작합니다.
      chrome.runtime.sendMessage({ action: "startTest", data: storageData }); // 시험 시작 메시지 보내기
    }
  );
}
