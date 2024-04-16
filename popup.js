// 팝업이 로드될 때 저장된 번역 데이터를 로드하는 함수입니다.
function loadStorageData() {
  // 백그라운드 스크립트에 'getTranslations' 작업을 요청하는 메시지를 보냅니다.
  // 이 메시지는 저장된 번역 데이터를 조회하기 위한 것입니다.
  chrome.runtime.sendMessage(
    { action: "getTranslations" },
    function (response) {
      // 응답으로 받은 데이터 중 'translations'를 추출합니다.
      // 만약 'translations' 데이터가 없다면 빈 배열을 사용합니다.
      const storageData =
        response && response.translations ? response.translations : [];
      // 추출한 데이터를 화면에 표시하는 함수를 호출합니다.
      console.log("스토리지 데이터", storageData);
      displayStorageData(storageData);
    }
  );
}

function displayStorageData(data) {
  // 출력을 위한 div 요소를 id를 통해 찾습니다.
  const outputDiv = document.getElementById("outputText");
  outputDiv.innerHTML = ""; // 출력 div를 초기화합니다. 기존의 내용을 지웁니다.

  // 부트스트랩 리스트 그룹을 생성합니다.
  const listGroup = document.createElement("ul");
  listGroup.classList.add("list-group");

  // 데이터 배열을 순회하면서 각 번역 데이터를 화면에 표시합니다.
  data.forEach((item) => {
    // 새로운 리스트 아이템 요소를 생성합니다. 이는 각 번역 데이터를 표시하기 위한 것입니다.
    const listItem = document.createElement("li");
    listItem.classList.add(
      "list-group-item",
      "d-flex",
      "justify-content-between",
      "align-items-center"
    );

    // 원문과 번역문을 포함하는 문자열을 설정합니다.
    listItem.innerHTML = `
      <div class="fw-bold">단어: ${item.originalText}</div>
      <span class="text-muted">뜻: ${item.translatedText}</span>
    `;

    // 최종적으로 생성된 리스트 아이템을 리스트 그룹에 자식 요소로 추가합니다.
    listGroup.appendChild(listItem);
  });

  // 최종적으로 생성된 리스트 그룹을 출력 div에 자식 요소로 추가합니다.
  outputDiv.appendChild(listGroup);
}

document.addEventListener("DOMContentLoaded", function () {
  let translateButton = document.getElementById("translateButton");
  let stopTestButton = document.getElementById("stopTestButton");
  let intervalId; // 인터벌 ID를 저장할 변수

  translateButton.addEventListener("click", function () {
    openTestPopup();
    // 10분마다 단어 시험 팝업이 반복적으로 열리도록 설정하고, 인터벌 ID를 저장합니다.
    // intervalId = setInterval(openTestPopup, 600000); // 600000ms = 10분
    intervalId = setInterval(openTestPopup, 10000);
    messageDiv.textContent = ""; // 시험 시작 시 이전 메시지를 지웁니다.
  });

  stopTestButton.addEventListener("click", function () {
    // 인터벌을 멈춥니다.
    if (intervalId) {
      clearInterval(intervalId);
      // "단어 시험을 멈춥니다!" 메시지를 출력합니다.
      alert("단어 시험을 멈춥니다!");
    }
  });
});

function openTestPopup() {
  const popupWidth = 800;
  const popupHeight = 800;

  chrome.windows.getCurrent(function (currentWindow) {
    const left = Math.round(
      (currentWindow.width - popupWidth) / 2 + currentWindow.left
    );
    const top = Math.round(
      (currentWindow.height - popupHeight) / 2 + currentWindow.top
    );

    chrome.windows.create({
      url: "test-popup.html",
      type: "popup",
      width: popupWidth,
      height: popupHeight,
      left: left,
      top: top,
    });
  });
}

// DOMContentLoaded 이벤트가 발생하면(즉, HTML 문서가 완전히 로드되고 파싱됐을 때),
// loadStorageData 함수를 호출하여 번역 데이터를 로드하고 표시합니다.
document.addEventListener("DOMContentLoaded", loadStorageData);
