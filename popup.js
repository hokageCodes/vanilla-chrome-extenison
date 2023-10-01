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
    const popup = document.querySelector(".popup");

    let recording = false;
    let paused = false;
    let mediaStream = null;
    let mediaRecorder = null;
    let mediaChunks = [];

    startStopButton.addEventListener("click", () => {
        if (!recording) {
            if (cameraToggle.checked && audioToggle.checked) {
                startRecording();
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
    });

    deleteButton.addEventListener("click", () => {
        // Delete recording logic (you can implement this functionality)
        // ...
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
                const videoSize = (recordedBlob.size / (1024 * 1024)).toFixed(2); // Convert to MB with two decimal places
                const videoURL = URL.createObjectURL(recordedBlob);
                console.log("Recording complete. Video URL:", videoURL);

                recordedVideo.src = videoURL;
                downloadLink.href = videoURL;
                downloadLink.style.display = "block";

                // Display the video size
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
});
