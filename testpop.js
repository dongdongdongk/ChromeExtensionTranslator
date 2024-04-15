// 백그라운드 스크립트에 'getTranslations' 작업을 요청하여 저장된 번역 데이터를 가져오고 화면에 출력합니다.
function loadStorageData() {
    chrome.runtime.sendMessage({ action: "getTranslations" }, function (response) {
      const storageData = response && response.translations ? response.translations : [];
      displayTest(storageData);
    });
  }
  
  function displayTest(data) {
    console.log("displayTest 함수 호출됨");
    const testContainer = document.getElementById("test-container");
    
    data.forEach((item) => {
      const questionContainer = document.createElement("div");
      questionContainer.classList.add("mb-3"); // 마진 바텀 추가
      
      const question = document.createElement("span");
      question.textContent = item.originalText + " 의 뜻은?";
      question.classList.add("form-label"); // 부트스트랩 라벨 클래스 추가
      
      const answerInput = document.createElement("input");
      answerInput.setAttribute("type", "text");
      answerInput.classList.add("form-control"); // 부트스트랩 폼 컨트롤 클래스 추가
      answerInput.dataset.original = item.originalText;
      
      questionContainer.appendChild(question);
      questionContainer.appendChild(answerInput);
      testContainer.appendChild(questionContainer);
    });
    
    const submitButton = document.getElementById("submit-button");
    // 버튼에 부트스트랩 버튼 클래스 추가
    submitButton.classList.add("btn", "btn-primary");
    submitButton.addEventListener("click", function () {
      submitTest(data);
    });
}

  
  function submitTest(data) {
    const answers = [];
    data.forEach((item) => {
      const userInput = document.querySelector(`input[data-original="${item.originalText}"]`).value;
      answers.push({
        originalText: item.originalText,
        userTranslation: userInput,
      });
    });
    evaluateTest(data, answers);
  }
  
  function evaluateTest(data, answers) {
    let correctCount = 0;
    data.forEach((item, index) => {
      if (item.translatedText.trim().toLowerCase() === answers[index].userTranslation.trim().toLowerCase()) {
        correctCount++;
      }
    });
    alert(`시험 결과: ${correctCount}/${data.length} 문제를 맞추셨습니다.`);
  }
  
  window.onload = function () {
    loadStorageData(); // 페이지 로드 시 데이터 로드를 호출
  };
  