document.addEventListener("DOMContentLoaded", function () {
    const startStopButton = document.getElementById("start-stop-button");
    const cameraToggle = document.getElementById("camera-toggle");
    const audioToggle = document.getElementById("audio-toggle");
    const pauseButton = document.getElementById("pause-button");
    const stopButton = document.getElementById("stop-button");
    const deleteButton = document.getElementById("delete-button");
    const recordedVideo = document.getElementById("recorded-video");
    const downloadLink = document.getElementById("download-link");
    const videoSizeElement = document.getElementById("video-size");
    const popupControls = document.getElementById("control-modal");
    const recordTimer = document.getElementById("record-timer");

    let recording = false;
    let paused = false;
    let mediaStream = null;
    let mediaRecorder = null;
    let mediaChunks = [];
    let startTime = 0;
    let timerInterval;

    function startTimer() {
        startTime = Date.now();
        timerInterval = setInterval(updateTimer, 1000);
    }

    function stopTimer() {
        clearInterval(timerInterval);
    }

    function updateTimer() {
        const currentTime = Date.now();
        const elapsedTime = new Date(currentTime - startTime);
        const seconds = String(elapsedTime.getSeconds()).padStart(2, "0");
        const minutes = String(elapsedTime.getMinutes()).padStart(2, "0");
        recordTimer.textContent = `${minutes}:${seconds}`;
    }
    
    function showControls() {
        popupControls.style.display = "flex";
        startTimer();
    }

    function hideControls() {
        popupControls.style.display = "none";
        stopTimer();
    }

    startStopButton.addEventListener("click", () => {
        if (!recording) {
            if (cameraToggle.checked && audioToggle.checked) {
                startRecording();
                showControls();
            } else {
                alert("Please enable both camera and audio to start recording.");
            }
        } else if (!paused) {
            pauseRecording();
        } else {
            resumeRecording();
        }
    });

    pauseButton.addEventListener("click", () => {
        if (recording && !paused) {
            pauseRecording();
        } else if (recording && paused) {
            resumeRecording();
        }
    });

    stopButton.addEventListener("click", () => {
        stopRecording();
        hideControls();
    });

    deleteButton.addEventListener("click", () => {
        if (recordedVideo.src) {
            URL.revokeObjectURL(recordedVideo.src);
            recordedVideo.src = "";
            downloadLink.style.display = "none";
        }
        hideControls();
    });

    async function startRecording() {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    cursor: "always",
                    displaySurface: "monitor"
                },
                audio: audioToggle.checked
            });

            const recorder = new MediaRecorder(stream);
            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    mediaChunks.push(event.data);
                }
            };
            recorder.onstop = () => {
                const recordedBlob = new Blob(mediaChunks, { type: 'video/webm' });
                const videoSize = (recordedBlob.size / (1024 * 1024)).toFixed(2);
                const videoURL = URL.createObjectURL(recordedBlob);

                recordedVideo.src = videoURL;
                downloadLink.href = videoURL;
                downloadLink.style.display = "block";

                videoSizeElement.textContent = `Video Size: ${videoSize} MB`;

                mediaChunks = [];
            };
            recorder.start();
            recording = true;
            mediaRecorder = recorder;
            mediaStream = stream;

            startStopButton.textContent = "Pause Recording";
        } catch (error) {
            console.error('Error accessing user media:', error);
        }
    }

    function pauseRecording() {
        if (mediaRecorder && recording && !paused) {
            mediaRecorder.pause();
            paused = true;
            startStopButton.textContent = "Resume Recording";
        }
    }

    function resumeRecording() {
        if (mediaRecorder && recording && paused) {
            mediaRecorder.resume();
            paused = false;
            startStopButton.textContent = "Pause Recording";
        }
    }

    function stopRecording() {
        if (mediaRecorder && recording) {
            mediaRecorder.stop();
            mediaStream.getTracks().forEach(track => track.stop());
            recording = false;
            paused = false;
            startStopButton.textContent = "Start Recording";
        }
    }

    const controlModal = document.getElementById("control-modal");

    // Show the modal when clicking the control button
    popupControls.addEventListener("click", () => {
        controlModal.style.display = "block";
    });

    // Hide the modal when clicking outside of it
    window.addEventListener("click", (event) => {
        if (event.target === controlModal) {
            controlModal.style.display = "none";
        }
    });
});
