const textDisplay = document.getElementById("text-display");
// const timer = document.getElementById("timer");
const wpmDisplay = document.getElementById("wpm");
const accuracyDisplay = document.getElementById("accuracy");
const countdown = document.getElementById('countdown');
const timeDisplay = document.getElementById("time-end");
const wpm = document.getElementById("wpm-end");
const acc = document.getElementById("acc-end");
const resultContainer = document.getElementById("result-container");
const containers = document.getElementsByClassName('container');
const toHide = document.getElementsByClassName('stat');

let sentence = "";            
let charIndex = 0;            
let selectedTime = 15;        
let timeLeft = selectedTime;  
let isTypingStarted = false;  
let charactersTyped = 0;      
let correctCharacters = 0;   
let testEnded = false;
let countdownInterval;
let currentLine = 0;
let scrollOffset = 0;

const MAX_VISIBLE_LINES = 3;


async function getRandomWords(count) {
    try {
        const response = await fetch(`https://random-word-api.herokuapp.com/word?number=${count}`);
        return await response.json();
    } catch (err) {
        console.error("Failed to fetch words:", err);
        return ["error"]; 
    }
}

function getWordCount(timeInSeconds) {
    const maxWPM = 80; 
    return Math.ceil((maxWPM / 60) * timeInSeconds * 1.5);
}

function updateScroll() {
    const spans = textDisplay.children;
    if (charIndex >= spans.length) return;

    const caretSpan = spans[charIndex];
    const lineHeight = parseFloat(getComputedStyle(caretSpan).lineHeight);
    const caretTop = caretSpan.offsetTop;

    if (caretTop >= (currentLine + 3) * lineHeight) {
        currentLine++;
        textDisplay.style.transform = `translateY(-${currentLine * lineHeight}px)`;
    }
}


async function generateRandomSentence() {
    const words = await getRandomWords(getWordCount(selectedTime));
    sentence = words.join(" ");
    loadText(sentence);
}

document.addEventListener("keydown", (e) => {
    if (testEnded || timeLeft<=0) return;
    // if (timeLeft<=0) return;
    const spans = textDisplay.children;
    if (spans.length === 0) return;
  
    if (e.key === "Backspace" && charIndex > 0) {
      charIndex--;
      clearActive(spans);
      spans[charIndex].classList.remove("correct", "incorrect");
      spans[charIndex].classList.add("active");
      return;
    }
  
    if (e.key.length !== 1) return;
    if (charIndex >= spans.length) return;
  
    startCountdown();
  
    const currentSpan = spans[charIndex];
  
    if (e.key === currentSpan.innerText) {
      currentSpan.classList.add("correct");
      correctCharacters++;
    } else {
      currentSpan.classList.add("incorrect");
    }
  
    currentSpan.classList.remove("active");
    charIndex++;
    charactersTyped++;
    updateScroll();
  
    if (charIndex < spans.length) {
      spans[charIndex].classList.add("active");
    } else {
      endTest(); 
    }
  });
  
function loadText(sentence) {
    textDisplay.innerHTML = "";
    charIndex = 0;
    charactersTyped = 0;
    correctCharacters = 0;
    currentLine=0;
    scrollOffset=0;
    textDisplay.style.transform = "translateY(0)";

    sentence.split("").forEach(char => {
        const span = document.createElement("span");
        span.innerText = char;
        textDisplay.appendChild(span);
    });
    clearActive(textDisplay.children);
    if (textDisplay.children.length > 0) {
        textDisplay.children[0].classList.add("active");
    }

    updateMetrics();
}

function updateMetrics() {
    const elapsedTime = Math.max(selectedTime - timeLeft, 1); 
    const wpm = Math.floor((charactersTyped / 5) / (elapsedTime / 60));
    const accuracy = charactersTyped === 0 ? 100 : Math.floor((correctCharacters / charactersTyped) * 100);
    countdown.innerHTML = `${timeLeft}`;
    wpmDisplay.textContent = `WPM: ${wpm}`;
    accuracyDisplay.textContent = `Accuracy: ${accuracy}%`;
}

function startCountdown() {
    if (isTypingStarted) return; 
    isTypingStarted = true;

    countdownInterval = setInterval(() => {
        timeLeft--;
        updateMetrics();

        if (timeLeft <= 0) {
            timeLeft=0;
            endTest();
        }
    }, 1000);
}


function clearActive(spans) {
    Array.from(spans).forEach(span => span.classList.remove("active"));
}

function endTest() {
    if (testEnded) return;
    testEnded = true;
    clearInterval(countdownInterval);
 
    const elapsedTime = selectedTime - timeLeft;
    const WPM = Math.floor((charactersTyped / 5) / (elapsedTime / 60));
    const accuracy = charactersTyped === 0 ? 100 : Math.floor((correctCharacters / charactersTyped) * 100);

    for (let i=0;i<containers.length;++i){
        containers[i].style.display="none";
    }
    for (let i=0;i<toHide.length;++i){
        toHide[i].style.display="none";
    }
    countdown.style.display="none";
    resultContainer.style.display="block";
    let times = document.getElementsByClassName("time");
    times[0].style.color="#e2b714";
        for (let i=1;i<times.length;++i){
            times[i].style.color="#646669";
        }

    
    timeDisplay.innerHTML=`${selectedTime}s`;
    wpm.innerHTML = `${WPM}`;
    acc.innerHTML = `${accuracy}%`;

    // alert(`Test completed!\nTime: ${elapsedTime}s\nWPM: ${WPM}\nAccuracy: ${accuracy}%`);
}

document.querySelectorAll(".time").forEach(item => {
    item.addEventListener("click", () => {
        document.querySelector(".time.active")?.classList.remove("active");

        item.classList.add("active");
        let times = document.getElementsByClassName("time");
        for (let i=0;i<times.length;++i){
            times[i].style.color="#646669";
        }
        item.style.color="#e2b714";
        selectedTime = Number(item.dataset.time);
        timeLeft = selectedTime; 
        generateRandomSentence(); 
    });
});

document.getElementById("reset").addEventListener("click", () => {
    clearInterval(countdownInterval);
    countdownInterval=null;
    containers[0].style.display = "flex";
    for (let i=1;i<containers.length;++i){
        containers[i].style.display="block";
    }
    for (let i=0;i<toHide.length;++i){
        toHide[i].style.display="block";
    }
    countdown.style.display="block";
    resultContainer.style.display="none";
    
    timeLeft = selectedTime;
    console.log(timeLeft);
    testEnded=false;
    isTypingStarted = false;
    charIndex = 0;
    charactersTyped = 0;
    correctCharacters = 0;
    updateMetrics();
    generateRandomSentence();
});
generateRandomSentence();
