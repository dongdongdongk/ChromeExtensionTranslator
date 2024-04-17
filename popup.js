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

// displayStorageData 함수는 저장된 번역 데이터를 화면에 표시하는 역할을 합니다.
function displayStorageData(data) {
  const outputDiv = document.getElementById("outputText");
  outputDiv.innerHTML = "";

  const listGroup = document.createElement("ul");
  listGroup.classList.add("list-group");

  if (data.length === 0) {
    const message = document.createElement("p");
    message.textContent = "등록된 영단어가 없습니다.";
    outputDiv.appendChild(message);
    return;
  }

  data.forEach((item, index) => {
    const listItem = document.createElement("li");
    listItem.classList.add(
      "list-group-item",
      "d-flex",
      "justify-content-between",
      "align-items-center"
    );
    listItem.dataset.index = index;

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "X";
    deleteButton.classList.add("btn", "btn-danger", "delete-btn");
    deleteButton.addEventListener("click", () => {
      deleteStorageData(index);
    });

    const wordSpan = document.createElement("span");
    wordSpan.textContent = `단어: ${item.originalText}`;
    wordSpan.style.fontWeight = "bold"; // 단어 굵게 표시

    const translationSpan = document.createElement("span");
    translationSpan.textContent = `뜻: ${item.translatedText}`;
    translationSpan.style.fontWeight = "normal"; // 뜻 기본 굵기

    listItem.appendChild(wordSpan);
    listItem.appendChild(document.createTextNode(" ")); // 단어와 뜻 사이 공백 추가
    listItem.appendChild(translationSpan);
    listItem.appendChild(deleteButton);

    listGroup.appendChild(listItem);
  });

  outputDiv.appendChild(listGroup);
}

// deleteStorageData 함수는 인덱스를 기반으로 저장된 번역 데이터를 삭제하는 역할을 합니다.
function deleteStorageData(index) {
  // chrome.storage.local에서 translations 키로 저장된 데이터를 가져옵니다.
  chrome.storage.local.get("translations", (data) => {
    const translations = data.translations || []; // 저장된 번역 데이터를 가져옵니다. 없으면 빈 배열을 사용합니다.
    // 삭제할 데이터를 제외한 나머지 데이터를 필터링하여 새 배열을 만듭니다.
    const updatedTranslations = translations.filter((_, i) => i !== index);
    // 변경된 데이터를 다시 chrome.storage.local에 저장합니다.
    chrome.storage.local.set({ translations: updatedTranslations }, () => {
      console.log(`${index} 인덱스 데이터가 삭제되었습니다.`); // 콘솔에 삭제된 인덱스 정보를 출력합니다.
      loadStorageData(); // 데이터 삭제 후 다시 로드합니다.
    });
  });
}

document.addEventListener("DOMContentLoaded", loadStorageData);

// 시작 버튼과 종료 버튼 요소 가져오기
const startTestButton = document.getElementById("startTestButton");
const stopTestButton = document.getElementById("stopTestButton");
const clearAllButton = document.querySelector("#clearAllButton");
let intervalId;

// 전체 삭제 함수
clearAllButton.addEventListener("click", function () {
  chrome.storage.local.remove("translations", () => {
    console.log("모든 데이터가 삭제되었습니다.");
    alert("모든 데이터가 삭제되었습니다.");
    loadStorageData(); // 데이터 삭제 후 다시 로드합니다.
  });
});

// 시작 버튼 클릭 이벤트 리스너 등록
startTestButton.addEventListener("click", function () {
  // 저장된 번역 데이터 확인
  chrome.storage.local.get("translations", function (data) {
    const translations = data.translations || [];
    if (translations.length === 0) {
      // 등록된 영단어가 없을 경우
      alert("등록된 영단어가 없습니다. 테스트를 시작할 수 없습니다.");
    } else {
      // 등록된 영단어가 있을 경우 테스트 시작 로직
      const delayInMinutes = parseInt(
        document.getElementById("delayInput").value
      );
      if (!isNaN(delayInMinutes) && delayInMinutes > 0) {
        chrome.alarms.create("modalPopupAlarm", { delayInMinutes });
        alert(`${delayInMinutes}분 후에 테스트가 시작됩니다!`);

        // delayInMinutes 값을 chrome.storage.local에 저장
        chrome.storage.local.set(
          { delayInMinutes: delayInMinutes },
          function () {
            console.log("지연 시간이 저장되었습니다.");
          }
        );
      } else {
        alert("유효한 시간을 입력하세요!");
      }
    }
  });
});

// 종료 버튼 클릭 이벤트 리스너 등록
stopTestButton.addEventListener("click", function () {
  // 알람 삭제
  chrome.alarms.clear("modalPopupAlarm");
  alert("테스트를 종료합니다!");
});
