let oshiList = [];

    // Fetching the oshi.json data
    fetch('oshi.json')
        .then(response => response.json())
        .then(data => {
            oshiList = data;
        })
        .catch(error => console.error('Error loading JSON:', error));

    function pickRandom(list) {
        return list[Math.floor(Math.random() * list.length)];
    }

    let isCooldown = false;

    document.getElementById('cekButton').addEventListener('click', cekOshi);

    function cekOshi() {
        if (isCooldown) return;

        const name = document.getElementById('nameInput').value.trim();
        if (!name) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Ketik namanya dengan benar dan pastikan telah memasukkan nama!',
            });
            return;
        }

        const oshi = pickRandom(oshiList);
        const imageAvailable = oshi.image !== undefined;
        const videoAvailable = oshi.video !== undefined;

        const resultContent = document.querySelector('.result-content');

        // Sembunyikan oshi-info dan infoIcon terlebih dahulu
        resultContent.querySelector('.oshi-info').style.display = 'none';
        resultContent.querySelector('.oshi-jiko').style.display = 'none';
        document.getElementById('infoIcon').style.display = 'none';

        resultContent.querySelector('.oshi-info').innerHTML = `
            <p><b><i class="fas fa-user-circle"></i> Nama: ${name}</b></p>
            <p><i class="fas fa-heart"></i> Oshi: ${oshi.name}</p>
            ${imageAvailable ? `<img id="oshiImage" src="${oshi.image}" alt="${oshi.name}" style="display:none;">` : ''}
            ${videoAvailable ? `<video id="oshiVideo" autoplay loop playsinline src="${oshi.video}" alt="${oshi.name}" style="display:none; width:100%; height:auto;"></video>` : ''}
        `;

        // Cek apakah jiko ada dalam data oshi
        const jikoPopup = document.getElementById('jikoPopup');
        const jikoIndonesia = document.getElementById('jikoIndonesia');
        const jikoInggris = document.getElementById('jikoInggris');

        if (oshi.jiko && oshi.jiko.jiko_indonesia) {
            jikoIndonesia.textContent = oshi.jiko.jiko_indonesia;
            jikoInggris.textContent = oshi.jiko.jiko_inggris;
            document.getElementById('infoIcon').style.display = 'inline-block'; // Tampilkan icon 'i'
        } else {
            jikoIndonesia.textContent = "Jiko tidak tersedia.";
            jikoInggris.textContent = "";
        }

        // Event listener untuk ikon 'i'
        document.getElementById('infoIcon').addEventListener('click', () => {
            jikoPopup.style.display = 'flex';
        });

        // Event listener untuk menutup popup ketika tombol 'x' di klik
        document.querySelector('.close-button').addEventListener('click', () => {
            jikoPopup.style.display = 'none';
        });
        const imageElement = document.getElementById('oshiImage');
        const videoElement = document.getElementById('oshiVideo');
        const buttonGroup = document.querySelector('.button-group');
        const backgroundAudio = document.getElementById('background-audio');

        const loadingSpinner = document.getElementById('loadingSpinner');
        loadingSpinner.style.display = 'block';

        setTimeout(() => {
            loadingSpinner.style.display = 'none';

            if (imageAvailable && videoAvailable) {
                buttonGroup.style.display = 'flex';
                document.getElementById('showImageButton').addEventListener('click', () => {
                    imageElement.style.display = 'block';
                    videoElement.style.display = 'none';
                    videoElement.pause();
                });
                // Menampilkan video dan memastikan video diputar
                document.getElementById('showVideoButton').addEventListener('click', () => {
                    videoElement.style.display = 'block';
                    videoElement.play();  // Memastikan video diputar saat ditampilkan
                    imageElement.style.display = 'none';
                    backgroundAudio.pause();
                });
            } else if (imageAvailable) {
                imageElement.style.display = 'block';
                                buttonGroup.style.display = 'none';
            } else if (videoAvailable) {
                videoElement.style.display = 'block';
                videoElement.play(); // Memastikan video diputar
                buttonGroup.style.display = 'none';
                backgroundAudio.pause();  // Menghentikan background-audio
            }

            // Tampilkan oshi-info dan oshi-jiko setelah hasil diproses
            resultContent.querySelector('.oshi-info').style.display = 'block';
            resultContent.querySelector('.oshi-jiko').style.display = 'block';
        }, 1000);

        // Memastikan audio diputar saat tombol cekButton diklik
        backgroundAudio.play().catch(error => {
            console.error("Audio play failed: ", error);
        });

        // Event listener untuk menghentikan/melanjutkan audio latar
        if (videoElement) {
            videoElement.addEventListener('play', () => {
                backgroundAudio.pause();
            });

            videoElement.addEventListener('pause', () => {
                backgroundAudio.play();
            });

            videoElement.addEventListener('ended', () => {
                backgroundAudio.play();
            });
        }

        isCooldown = true;
        const cekButton = document.getElementById('cekButton');
        cekButton.classList.add('cooldown');
        cekButton.disabled = true;
        let cooldownTime = 1;
        cekButton.innerHTML = `Cek (${cooldownTime})`;
        const interval = setInterval(() => {
            cooldownTime -= 1;
            cekButton.innerHTML = `Cek (${cooldownTime})`;
            if (cooldownTime <= 0) {
                clearInterval(interval);
                isCooldown = false;
                cekButton.classList.remove('cooldown');
                cekButton.disabled = false;
                cekButton.innerHTML = '<i class="fas fa-search"></i> Cek';
            }
        }, 1000);
    }

    // Memastikan audio berjalan dengan benar saat halaman dimuat
    document.addEventListener('DOMContentLoaded', () => {
    // Menyembunyikan icon 'i' pada awal halaman dimuat
    document.getElementById('infoIcon').style.display = 'none';

    const audio = document.getElementById('background-audio');
    const sources = audio.getElementsByTagName('source');
    let currentTrack = 0;
    audio.volume = 1;
    audio.addEventListener('ended', () => {
        currentTrack = (currentTrack + 1) % sources.length;
        audio.src = sources[currentTrack].src;
        audio.play().catch(error => {
            console.error("Audio play failed: ", error);
        });
    });
});