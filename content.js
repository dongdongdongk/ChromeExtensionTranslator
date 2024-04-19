// content.js

// 링크 추가
const link = document.createElement("link");
link.href =
  "https://fonts.googleapis.com/css2?family=Nanum+Gothic:wght@400&display=swap";
link.rel = "stylesheet";
document.head.appendChild(link);

// 전체에 폰트 적용
document.body.style.fontFamily = "'Nanum Gothic', sans-serif";

// 마지막으로 displayTranslation이 호출된 시간을 저장하는 변수
let lastDisplayTranslationTime = 0;

// translateSelectedText 함수는 사용자가 선택한 텍스트를 가져와 번역하는 역할
// 선택된 텍스트를 번역하는 함수
function translateSelectedText() {
  // 선택된 텍스트 가져오기
  const selectedText = window.getSelection().toString().trim();
  if (selectedText !== "") {
    translateText(selectedText);
  }
  console.log("translateSelectedText 함수 호출됨");
}

// translateText 함수는 Google 번역 API를 사용하여 텍스트를 번역합니다. 번역된 텍스트를 가져온 후 displayTranslation 함수를 호출하여 번역된 내용을 표시
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

// displayTranslation 함수는 번역된 텍스트를 화면에 표시하는 역할을 합니다. 선택된 텍스트의 위치 옆에 번역된 텍스트를 표시하고, 추가 및 닫기 버튼을 포함한 인터페이스를 생성
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
    // 번역된 텍스트를 표시할 div 요소 생성 및 스타일링
    const translationDiv = document.createElement("div");
    translationDiv.innerText = translatedText;
    translationDiv.classList.add("translationDiv"); // 클래스 추가
    translationDiv.style.position = "absolute";
    translationDiv.style.top = `${rect.top + window.pageYOffset + 20}px`; // 선택된 텍스트의 상단 위치 사용
    translationDiv.style.left = `${rect.right + window.pageXOffset + 10}px`; // 선택된 텍스트 우측에 위치
    translationDiv.style.backgroundColor = "#f8f9fa";
    translationDiv.style.border = "1px solid #ccc";
    translationDiv.style.boxShadow = "0 4px 6px rgba(0,0,0,.1)";
    translationDiv.style.padding = "10px";
    translationDiv.style.zIndex = "9999";
    translationDiv.style.borderRadius = "8px";
    translationDiv.style.display = "flex";
    translationDiv.style.alignItems = "center";
    translationDiv.style.justifyContent = "space-between";
    translationDiv.style.maxWidth = "400px"; // 최대 너비 설정
    translationDiv.style.boxSizing = "border-box";

    // 이전에 추가된 innerText 제거
    translationDiv.innerHTML = "";

    // 번역된 텍스트를 표시할 p 요소 생성 및 추가
    const translatedTextP = document.createElement("p");
    translatedTextP.innerText = translatedText;
    translatedTextP.style.margin = "0";
    translatedTextP.style.flexGrow = "1";
    translationDiv.appendChild(translatedTextP);

    // 음성 출력 이미지 요소 생성 및 스타일링
    const voiceButton = document.createElement("img");
    voiceButton.setAttribute(
      "src",
      chrome.runtime.getURL("/images/icons8-sound-48.png")
    ); // 이미지 파일 경로 설정
    voiceButton.setAttribute("alt", "음성 출력");
    voiceButton.style.cursor = "pointer";
    voiceButton.style.width = "28px";
    voiceButton.style.height = "28px";
    voiceButton.style.marginLeft = "12px";

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
    addButton.classList.add("btn", "btn-primary"); // 부트스트랩 클래스 추가
    addButton.style.margin = "0 5px";
    addButton.style.backgroundColor = "#28a745";
    addButton.style.color = "#fff";
    addButton.style.border = "none";
    addButton.style.borderRadius = "5px";
    addButton.addEventListener("click", () => {
      addButtonClickHandler(originalText, translatedText);
      translationDiv.remove(); // 번역된 상자를 추가한 후 즉시 제거
    });
    translationDiv.appendChild(addButton);

    // 번역된 텍스트 닫기 버튼 생성 및 스타일링
    const closeButton = document.createElement("button");
    closeButton.innerText = "닫기";
    closeButton.classList.add("btn", "btn-danger"); // 부트스트랩 클래스 추가
    closeButton.style.backgroundColor = "#dc3545";
    closeButton.style.color = "#fff";
    closeButton.style.border = "none";
    closeButton.style.borderRadius = "5px";
    closeButton.addEventListener("click", () => {
      closeTranslationBox(translationDiv); // 닫기 버튼 클릭 시 처리 함수 호출
    });
    translationDiv.appendChild(closeButton);

    // 번역된 텍스트를 body에 추가
    document.body.appendChild(translationDiv);
  }
}

// speakText 함수는 선택된 텍스트를 음성으로 출력하는 역할
// 음성 출력 함수 (영어로 설정)
function speakText(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US"; // 언어를 영어(미국)으로 설정
  window.speechSynthesis.speak(utterance);
}

// addButtonClickHandler 함수는 번역된 텍스트를 로컬 스토리지에 추가하는 역할을 합니다. 이 함수는 추가 버튼이 클릭될 때 호출
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

// closeTranslationBox 함수는 번역된 상자를 닫는 역할을 합니다. 닫기 버튼이 클릭될 때 호출
// 번역된 상자를 닫는 함수
function closeTranslationBox(translationDiv) {
  translationDiv.remove(); // 번역된 상자 제거
  console.log("closeTranslationBox 함수 호출됨");
  event.stopPropagation(); // 이벤트 전파 중지
}

// 최대 허용 길이 설정 (예: 20)
const MAX_TEXT_LENGTH = 20;

// isEnglishWordOrIdiom 함수는 선택된 텍스트가 영어 단어 또는 숙어인지 여부를 확인하는 역할
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
// setTimeout(startTestFromContentScript, 10000); // 1분 후에 시험 시작

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

// chrome.runtime.onMessage.addListener 함수는 확장 프로그램으로부터 메시지를 수신하는 이벤트를 처리합니다. "showModal" 액션을 수신하면 모달 창을 표시합니다. 모달 창은 오버레이(어두운 배경)와 함께 생성되며, 닫기 버튼을 클릭하면 창이 닫힙니다. 이후 loadStorageData 함수를 호출하여 저장된 번역 데이터를 모달에 출력
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "showModal") {
    // 배경 요소 생성
    const overlay = document.createElement("div");
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5); /* 어두운 배경색 */
      z-index: 999; /* 모달보다 낮은 z-index */
    `;

    // 모달 요소 생성
    const modal = document.createElement("div");
    modal.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 60%;
      height: 60%;
      background-color: white;
      z-index: 1000;
      border: 2px solid black;
      padding: 20px;
      box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);
      overflow-y: auto; /* 컨텐츠가 많을 경우 스크롤 */
    `;

    // 모달 창과 배경을 body에 추가
    document.body.appendChild(overlay);
    document.body.appendChild(modal);

    // 닫기 버튼 추가 (X 모양)
    const closeButton = document.createElement("button");
    closeButton.innerHTML = "&times;"; // X 모양
    closeButton.style.cssText = `
      position: absolute;
      top: 10px;
      right: 10px;
      background-color: transparent;
      border: none;
      cursor: pointer;
      font-size: 20px;
    `;
    closeButton.addEventListener("click", () => {
      modal.remove();
      overlay.remove(); // 배경 제거
      // delayInMinutes 값을 chrome.storage.local에서 가져옴
      chrome.storage.local.get(["delayInMinutes"], function (result) {
        const delayInMinutes = result.delayInMinutes;
        alert(`${delayInMinutes}분 뒤 시험이 시작됩니다!`);
        // "retryTestAlarm" 액션과 delayInMinutes 값을 함께 보냅니다.
        chrome.runtime.sendMessage({
          action: "retryTestAlarm",
          delay: delayInMinutes,
        });
      });
    });
    modal.appendChild(closeButton);

    // 저장된 번역 데이터를 로드하여 모달에 출력
    loadStorageData(modal, overlay);
  }
});

// loadStorageData 함수는 저장된 번역 데이터를 가져오는 역할을 합니다. getTranslations 액션을 사용하여 백그라운드 스크립트에 요청을 보내고, 응답으로 받은 데이터를 displayTest 함수에 전달하여 모달에 출력
function loadStorageData(modal, overlay) {
  chrome.runtime.sendMessage(
    { action: "getTranslations" },
    function (response) {
      const storageData =
        response && response.translations ? response.translations : [];
      displayTest(storageData, modal, overlay);
    }
  );
}

// 재시험 함수 구현
function retryTest(data, modal, overlay) {
  modal.innerHTML = ""; // 모달 내용 비우기
  displayTest(data, modal, overlay); // 다시 시험을 시작합니다.
}

// displayTest 함수는 저장된 번역 데이터를 기반으로 영단어 테스트의 UI를 생성하고 모달에 추가
function displayTest(data, modal, overlay) {
  const modalContent = document.createElement("div");
  modalContent.style.cssText = `
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: space-between;
`;

  // 헤더 생성 및 스타일 설정
  const modalHeader = document.createElement("div");
  modalHeader.style.cssText =
    "background-color: #667eea; padding: 20px; display: flex; justify-content: center; align-items: center; color: #FFFFFF; font-size: 20px; border-radius: 5px";

  const modalTitle = document.createElement("h2");
  modalTitle.textContent = "스파르타 암기 번역기";
  modalHeader.appendChild(modalTitle);

  modalContent.appendChild(modalHeader);

  const testContainer = document.createElement("div");
  testContainer.style.cssText = `
  padding: 16px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #f8f9fa;
  overflow-y: auto;
  flex-grow: 1;
`;

  const testTitle = document.createElement("h2");
  testTitle.textContent = "영단어 테스트";
  testTitle.style.cssText = "margin-bottom: 16px;";
  testContainer.appendChild(testTitle);

  const testDescription = document.createElement("p");
  testDescription.textContent = "아래에 단어의 뜻을 입력해주세요.";
  testDescription.style.cssText = "margin-bottom: 16px;";
  testContainer.appendChild(testDescription);

  data.forEach((item) => {
    const questionContainer = document.createElement("div");
    questionContainer.style.cssText = "margin-bottom: 10px;";

    const question = document.createElement("span");
    question.textContent = `${item.originalText}의 뜻은?`;
    questionContainer.appendChild(question);

    const answerInput = document.createElement("input");
    answerInput.setAttribute("type", "text");
    answerInput.style.cssText = `
      display: block;
      width: calc(100% - 16px);
      padding: 8px;
      margin-top: 5px;
      border: 1px solid #ccc;
      border-radius: 4px;
      box-sizing: border-box;
    `;
    answerInput.dataset.original = item.originalText;
    questionContainer.appendChild(answerInput);

    testContainer.appendChild(questionContainer);
  });

  const buttonContainer = document.createElement("div");
  buttonContainer.style.cssText = "display: flex; justify-content: flex-end;";

  const submitButton = document.createElement("button");
  submitButton.textContent = "제출";
  submitButton.style.cssText = `
    display: inline-block;
    background-color: #667eea; /* 기본 배경색 */
    color: #ffffff;
    padding: 8px 12px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    margin-right: 10px;
    transition: background-color 0.3s ease;
  `;

  // 마우스가 버튼 위에 있을 때 배경색 변경
  submitButton.addEventListener("mouseover", function () {
    submitButton.style.backgroundColor = "#5a67d8"; // 호버 시 배경색
  });

  // 마우스가 버튼에서 벗어날 때 원래 배경색으로 복원
  submitButton.addEventListener("mouseout", function () {
    submitButton.style.backgroundColor = "#667eea"; // 기본 배경색
  });

  submitButton.addEventListener("click", function () {
    submitTest(data, modal, overlay);
    submitButton.style.display = "none";
  });
  buttonContainer.appendChild(submitButton);

  const closeButton = document.createElement("button");
  closeButton.textContent = "닫기";
  closeButton.style.cssText = `
    display: none; /* 초기에는 숨김 */
    background-color: #667eea; /* 기본 배경색 */
    color: #ffffff;
    padding: 8px 12px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s ease;
  `;

  // 마우스가 버튼 위에 있을 때 배경색 변경
  closeButton.addEventListener("mouseover", function () {
    closeButton.style.backgroundColor = "#5a67d8"; // 호버 시 배경색
  });

  // 마우스가 버튼에서 벗어날 때 원래 배경색으로 복원
  closeButton.addEventListener("mouseout", function () {
    closeButton.style.backgroundColor = "#667eea"; // 기본 배경색
  });

  closeButton.addEventListener("click", function () {
    modal.remove();
    overlay.remove(); // 배경 제거
    // delayInMinutes 값을 chrome.storage.local에서 가져옴
    chrome.storage.local.get(["delayInMinutes"], function (result) {
      const delayInMinutes = result.delayInMinutes;
      alert(`${delayInMinutes}분 뒤 시험이 시작됩니다!`);
      // "retryTestAlarm" 액션과 delayInMinutes 값을 함께 보냅니다.
      chrome.runtime.sendMessage({
        action: "retryTestAlarm",
        delay: delayInMinutes,
      });
    });
  });
  buttonContainer.appendChild(closeButton);

  testContainer.appendChild(buttonContainer);
  modalContent.appendChild(testContainer);

  // 푸터 생성
  const modalFooter = document.createElement("div");
  modalFooter.style.cssText =
    "background-color: #667eea; padding: 5px; display: flex; justify-content: center; align-items: center; color: #FFFFFF; border-radius: 5px";
  const modalFooterTitle = document.createElement("h3");
  modalFooterTitle.textContent = "© 2024 AHA Music";

  modalFooter.appendChild(modalFooterTitle);

  modalContent.appendChild(modalFooter);

  modal.appendChild(modalContent);
}

// submitTest 함수는 사용자가 제출한 테스트를 처리하고 결과를 출력
function submitTest(data, modal, overlay) {
  const answers = [];
  data.forEach((item) => {
    const userInput = document.querySelector(
      `input[data-original="${item.originalText}"]`
    ).value;
    answers.push({
      originalText: item.originalText,
      userTranslation: userInput,
    });
  });
  evaluateTest(data, answers, modal, overlay);
}

// evaluateTest 함수는 사용자의 답변을 평가하고 결과를 출력
function evaluateTest(data, answers, modal, overlay) {
  const modalContent = document.createElement("div");
  modalContent.style.cssText =
    "display: flex; flex-direction: column; height: 100%; justify-content: space-between;"; // 수정된 부분

  // 헤더 생성 및 스타일 설정
  const modalHeader = document.createElement("div");
  modalHeader.style.cssText =
    "background-color: #667eea; padding: 20px; display: flex; justify-content: center; align-items: center; color: #FFFFFF; font-size: 20px; border-radius: 5px";

  const modalTitle = document.createElement("h2");
  modalTitle.textContent = "스파르타 암기 번역기";
  modalHeader.appendChild(modalTitle);

  modalContent.appendChild(modalHeader);

  const testContainer = document.createElement("div");
  testContainer.style.cssText = `
    padding: 16px;
    border: 1px solid #ccc;
    border-radius: 5px;
    background-color: #f8f9fa;
    flex-grow: 1; /* 헤더와 푸터 사이의 공간을 채우도록 설정 */
  `;

  const testTitle = document.createElement("h2");
  testTitle.textContent = "영단어 테스트";
  testTitle.style.cssText = "margin-bottom: 16px;";
  testContainer.appendChild(testTitle);

  data.forEach((item, index) => {
    const userAnswer = answers[index].userTranslation.trim().toLowerCase();
    const correctAnswer = item.translatedText.trim().toLowerCase();

    const questionContainer = document.createElement("div");
    questionContainer.style.cssText = "margin-bottom: 10px;";

    const question = document.createElement("span");
    question.textContent = `${item.originalText}의 뜻은?`;
    questionContainer.appendChild(question);

    const answerInput = document.createElement("input");
    answerInput.setAttribute("type", "text");
    answerInput.style.cssText = `
    display: block;
    width: calc(100% - 16px);
    padding: 8px;
    margin-top: 5px;
    border-radius: 4px;
    box-sizing: border-box;
    `;

    // 정답과 비교하여 스타일 및 메시지 설정
    if (userAnswer === correctAnswer) {
      // 정답일 경우
      answerInput.style.border = "1px solid #28a745"; // 초록색 테두리
      answerInput.style.backgroundColor = "#f6fdf8"; // 초록색 배경
      const correctMessage = document.createElement("span");
      correctMessage.textContent = "정답입니다.";
      correctMessage.style.color = "#28a745"; // 초록색 텍스트
      questionContainer.appendChild(correctMessage);
    } else {
      // 오답일 경우
      answerInput.style.border = "1px solid #dc3545"; // 빨간색 테두리
      answerInput.style.backgroundColor = "#fff9fa"; // 빨간색 배경
      answerInput.style.textDecoration = "line-through"; // 취소선
    }

    // 사용자가 입력한 답을 입력란에 채웁니다.
    answerInput.value = userAnswer;
    questionContainer.appendChild(answerInput);

    // 오답인 경우 정답 메시지 추가
    // 오답인 경우 정답 메시지 추가
    if (userAnswer !== correctAnswer) {
      const wrongMessage = document.createElement("span");
      wrongMessage.textContent = `틀렸습니다. 정답은 "${correctAnswer}"입니다.`;
      wrongMessage.style.color = "#dc3545"; // 빨간색 텍스트
      wrongMessage.style.marginTop = "10px"; // 위쪽과의 거리 추가
      questionContainer.appendChild(wrongMessage);
    }

    testContainer.appendChild(questionContainer);
  });
  // 결과 메시지 출력
  const resultMessage = document.createElement("p");
  const correctCount = answers.filter((answer) =>
    data.find(
      (item) =>
        item.translatedText.trim().toLowerCase() ===
        answer.userTranslation.trim().toLowerCase()
    )
  ).length;
  resultMessage.textContent = `시험 결과: ${correctCount}/${data.length} 문제를 맞추셨습니다.`;
  testContainer.appendChild(resultMessage);

  // 닫기 버튼 추가 (X 모양)
  const closeButton = document.createElement("button");
  closeButton.innerHTML = "&times;"; // X 모양
  closeButton.style.cssText = `
    position: absolute;
    top: 10px;
    right: 10px;
    background-color: transparent;
    border: none;
    cursor: pointer;
    font-size: 20px;
  `;
  closeButton.addEventListener("click", () => {
    modal.remove();
    overlay.remove(); // 배경 제거

    // delayInMinutes 값을 chrome.storage.local에서 가져옴
    chrome.storage.local.get(["delayInMinutes"], function (result) {
      const delayInMinutes = result.delayInMinutes;
      alert(`${delayInMinutes}분 뒤 시험이 시작됩니다!`);
      // "retryTestAlarm" 액션과 delayInMinutes 값을 함께 보냅니다.
      chrome.runtime.sendMessage({
        action: "retryTestAlarm",
        delay: delayInMinutes,
      });
    });
  });
  testContainer.appendChild(closeButton);

  // 재시험 버튼 생성
  const retryButton = document.createElement("button");
  retryButton.textContent = "재시험";
  retryButton.style.cssText = `
  display: inline-block;
  background-color: #667eea; /* 기본 배경색 */
  color: #ffffff;
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;
  margin-right: 10px;
  transition: background-color 0.3s ease;
  `;

  // 마우스가 버튼 위에 있을 때 배경색 변경
  retryButton.addEventListener("mouseover", function () {
    retryButton.style.backgroundColor = "#5a67d8"; // 호버 시 배경색
  });

  // 마우스가 버튼에서 벗어날 때 원래 배경색으로 복원
  retryButton.addEventListener("mouseout", function () {
    retryButton.style.backgroundColor = "#667eea"; // 기본 배경색
  });

  retryButton.addEventListener("click", function () {
    // 재시험 버튼 클릭 시 재시험 함수 호출
    retryTest(data, modal, overlay);
  });
  testContainer.appendChild(retryButton);

  modal.innerHTML = ""; // 모달 내용 비우기
  modal.appendChild(testContainer);

  // 시험 후 닫기 버튼을 추가
  const closeTestButton = document.createElement("button");
  closeTestButton.textContent = "닫기";
  closeTestButton.style.cssText = `
  display: inline-block;
  background-color: #667eea; /* 기본 배경색 */
  color: #ffffff;
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;
  margin-right: 10px;
  transition: background-color 0.3s ease;
  `;

  // 마우스가 버튼 위에 있을 때 배경색 변경
  closeTestButton.addEventListener("mouseover", function () {
    closeTestButton.style.backgroundColor = "#5a67d8"; // 호버 시 배경색
  });

  // 마우스가 버튼에서 벗어날 때 원래 배경색으로 복원
  closeTestButton.addEventListener("mouseout", function () {
    closeTestButton.style.backgroundColor = "#667eea"; // 기본 배경색
  });

  closeTestButton.addEventListener("click", function () {
    // 모달과 오버레이 제거
    modal.remove();
    overlay.remove();

    // delayInMinutes 값을 chrome.storage.local에서 가져옴
    chrome.storage.local.get(["delayInMinutes"], function (result) {
      const delayInMinutes = result.delayInMinutes;
      alert(`${delayInMinutes}분 뒤 시험이 시작됩니다!`);
      // "retryTestAlarm" 액션과 delayInMinutes 값을 함께 보냅니다.
      chrome.runtime.sendMessage({
        action: "retryTestAlarm",
        delay: delayInMinutes,
      });
    });
  });
  testContainer.appendChild(closeTestButton);

  // 시험 중단 버튼을 추가
  const stopTestButton = document.createElement("button");
  stopTestButton.textContent = "시험 중단";
  stopTestButton.style.cssText = `
  display: inline-block;
  background-color: #667eea; /* 기본 배경색 */
  color: #ffffff;
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;
  margin-right: 10px;
  transition: background-color 0.3s ease;
  `;

  // 마우스가 버튼 위에 있을 때 배경색 변경
  stopTestButton.addEventListener("mouseover", function () {
    stopTestButton.style.backgroundColor = "#5a67d8"; // 호버 시 배경색
  });

  // 마우스가 버튼에서 벗어날 때 원래 배경색으로 복원
  stopTestButton.addEventListener("mouseout", function () {
    stopTestButton.style.backgroundColor = "#667eea"; // 기본 배경색
  });

  stopTestButton.addEventListener("click", function () {
    // 모달과 오버레이 제거
    modal.remove();
    overlay.remove();
    // 알람 삭제
    // 콘텐츠 스크립트
    chrome.runtime.sendMessage({ action: "stopAlarm" });
    alert("시험 반복을 중단합니다.");
  });
  testContainer.appendChild(stopTestButton);

  // 푸터 생성
  const modalFooter = document.createElement("div");
  modalFooter.style.cssText =
    "background-color: #667eea; padding: 5px; display: flex; justify-content: center; align-items: center; color: #FFFFFF; border-radius: 5px";
  const modalFooterTitle = document.createElement("h3");
  modalFooterTitle.textContent = "© 2024 AHA Music";

  modalFooter.appendChild(modalFooterTitle);

  modalContent.appendChild(modalFooter);

  modal.appendChild(modalContent);
}

window.onload = function () {
  loadStorageData(); // 페이지 로드 시 데이터 로드를 호출
};
