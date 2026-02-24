const dataUrl = 'https://raw.githubusercontent.com/dreamliner21/mainDB/master/tebakjkt48.json';
let data = [];
let currentMember = null;
let currentHint = '';
let currentSession = 1;
let sessionQuestions = [];
let sessionTimer;
let playerScore = 0;
let sessionScores = [];

const correctSound = new Audio('https://j.top4top.io/m_3167c3qed1.mp3');
const incorrectSound = new Audio('https://d.top4top.io/m_3167u9am41.mp3');

document.getElementById('start-btn').addEventListener('click', showNameInput);
document.getElementById('main-now-btn').addEventListener('click', startGameAfterNameInput);
document.getElementById('submit-btn').addEventListener('click', checkAnswer);
document.getElementById('nyerah-btn').addEventListener('click', giveUp);
document.getElementById('hint-btn').addEventListener('click', showHint);
document.getElementById('next-btn').addEventListener('click', nextQuestion);
document.getElementById('prev-btn').addEventListener('click', prevQuestion);

function showNameInput() {
    document.getElementById('start-btn').classList.add('hidden');
    document.getElementById('name-input-container').classList.remove('hidden');
}

function startGameAfterNameInput() {
    const name = document.getElementById('name-input').value.trim();
    if (name === '') {
        Swal.fire({
            title: 'Peringatan!',
            text: 'Masukkan nama terlebih dahulu!',
            icon: 'warning'
        });
        return;
    }

    localStorage.setItem('playerName', name);
    document.getElementById('name-input-container').classList.add('hidden');
    startCountdown();
}

async function startCountdown() {
    document.getElementById('countdown-text').innerText = 'Bersiap untuk bermain';
    document.getElementById('countdown').innerText = 5;
    document.getElementById('countdown-container').classList.remove('hidden');
    
    const countdownInterval = setInterval(() => {
        let countdown = parseInt(document.getElementById('countdown').innerText);
        countdown--;
        if (countdown > 0) {
            document.getElementById('countdown').innerText = countdown;
        } else {
            clearInterval(countdownInterval);
            document.getElementById('countdown-container').classList.add('hidden');
            startGame();
        }
    }, 1000);
}

async function startGame() {
    try {
        const response = await fetch(dataUrl);
        data = await response.json();
        
        document.getElementById('nyerah-btn').classList.remove('hidden');
        document.getElementById('hint-btn').classList.remove('hidden');
        document.getElementById('session-info').classList.remove('hidden');
        document.getElementById('question-container').classList.remove('hidden');
        
        loadSession();
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

function loadSession() {
    if (currentSession <= 8) {
        sessionQuestions = getRandomQuestions(data, 5);
        startSessionTimer();
        loadQuestion();
    } else {
        endGame('Selamat! Kamu telah menyelesaikan semua sesi.');
    }
}

function getRandomQuestions(data, count) {
    let questions = [];
    while (questions.length < count) {
        const randomIndex = Math.floor(Math.random() * data.length);
        const question = data[randomIndex];
        if (!questions.includes(question)) {
            questions.push(question);
        }
    }
    return questions;
}

function loadQuestion() {
    if (sessionQuestions.length > 0) {
        currentMember = sessionQuestions.shift();
        document.getElementById('member-img').src = currentMember.img;
        document.getElementById('jiko-text').innerText = currentMember.jiko;
        currentHint = generateHint(currentMember.jawaban);
    } else {
        endSession();
    }
}

function checkAnswer() {
    const answerInput = document.getElementById('answer-input').value.trim().toUpperCase();
    const correctAnswer = currentMember.jawaban.toUpperCase();

    if (answerInput === '') {
        Swal.fire({
            title: 'Peringatan!',
            text: 'Masukkan jawaban terlebih dahulu!',
            icon: 'warning'
        });
        return;
    }

    if (answerInput === correctAnswer) {
        correctSound.play();
        playerScore += 10; // Menambahkan skor setiap jawaban benar
        Swal.fire({
            title: 'Benar!',
            text: 'Jawaban kamu benar! +10 Poin',
            icon: 'success'
        });
        loadQuestion();
    } else {
        incorrectSound.play();
        Swal.fire({
            title: 'Salah!',
            text: 'Jawabanmu Salah. Jawablah dengan benar',
            icon: 'error'
        });
    }

    document.getElementById('answer-input').value = '';
}

function showHint() {
    Swal.fire({
        title: 'Hint',
        text: currentHint,
        icon: 'info'
    });
}

function generateHint(answer) {
    let hintArray = answer.split('');
    let hint = '';

    const numToReveal = Math.ceil(answer.length / 2);
    const indicesToReveal = new Set();
    
    while (indicesToReveal.size < numToReveal) {
        const randomIndex = Math.floor(Math.random() * answer.length);
        indicesToReveal.add(randomIndex);
    }

    hintArray.forEach((char, index) => {
        hint += indicesToReveal.has(index) ? char : '_';
    });

    return hint;
}

function startSessionTimer() {
    const sessionTimerElement = document.getElementById('session-timer');
    let timeRemaining = 120; // 2 menit

    sessionTimerElement.innerText = timeRemaining;

    sessionTimer = setInterval(() => {
        timeRemaining--;
        sessionTimerElement.innerText = timeRemaining;

        if (timeRemaining <= 0) {
            clearInterval(sessionTimer);
            endSession();
        }
    }, 1000);
}

function endSession() {
    clearInterval(sessionTimer);
    sessionScores.push(playerScore); // Simpan skor sesi ini

    Swal.fire({
        title: 'Sesi selesai!',
        text: `Kamu mendapatkan ${playerScore} poin dalam sesi ini.`,
        icon: 'info',
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: 'Lanjutkan ke sesi berikutnya',
        denyButtonText: 'Nyerah'
    }).then((result) => {
        if (result.isConfirmed) {
            currentSession++;
            playerScore = 0; // Reset skor untuk sesi berikutnya
            if (currentSession <= 8) {
                document.getElementById('session-info').querySelector('#session-number').innerText = currentSession;
                startCountdown();  // Mulai sesi berikutnya dengan countdown
            } else {
                endGame('Selamat! Kamu telah menyelesaikan semua sesi.');
            }
        } else if (result.isDenied) {
            giveUp();
        }
    });
}

function nextQuestion() {
    if (currentQuestionIndex < sessionQuestions.length - 1) {
        currentQuestionIndex++;
        loadQuestion();
    }
}

function prevQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        loadQuestion();
    }
}

function updateNavigationButtons() {
    document.getElementById('prev-btn').disabled = (currentQuestionIndex === 0);
    document.getElementById('next-btn').disabled = (currentQuestionIndex === sessionQuestions.length - 1);
}

function giveUp() {
    Swal.fire({
        title: 'Nyerah?',
        text: "Kamu akan kembali ke halaman awal. Poin yang sudah didapat akan dihitung.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Ya, nyerah!',
        cancelButtonText: 'Tidak, lanjut!'
    }).then((result) => {
        if (result.isConfirmed) {
            endGame(`Permainan berakhir! Skor akhir kamu adalah: ${calculateTotalScore()} poin.`);
        }
    });
}

function endGame(message) {
    Swal.fire({
        title: 'Permainan selesai!',
        html: `
            ${message}
            <br><br>
            <strong>Poin yang diraih:</strong><br>
            ${sessionScores.map((score, index) => `Sesi ${index + 1}: ${score} poin`).join('<br>')}
            <br><br>
            <strong>Total Poin: ${calculateTotalScore()} poin</strong>
        `,
        icon: 'success',
        confirmButtonText: 'Kembali ke Halaman Awal'
    }).then(() => resetGame());
}

function calculateTotalScore() {
    return sessionScores.reduce((total, score) => total + score, 0);
}

function resetGame() {
    document.getElementById('start-btn').classList.remove('hidden');
    document.getElementById('name-input-container').classList.add('hidden');
    document.getElementById('session-info').classList.add('hidden');
    document.getElementById('question-container').classList.add('hidden');
    document.getElementById('nyerah-btn').classList.add('hidden');
    document.getElementById('hint-btn').classList.add('hidden');
    document.getElementById('prev-btn').classList.add('hidden');
    document.getElementById('next-btn').classList.add('hidden');
    document.getElementById('answer-input').value = '';
    document.getElementById('member-img').src = '';
    document.getElementById('jiko-text').innerText = '';
    document.getElementById('countdown-container').classList.add('hidden');
    currentSession = 1;
    playerScore = 0;
    sessionScores = [];
    sessionQuestions = [];
    if (sessionTimer) {
        clearInterval(sessionTimer);
    }
}