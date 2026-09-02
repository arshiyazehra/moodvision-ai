document.addEventListener("DOMContentLoaded", function () {


    // ==============================
    // GET HTML ELEMENTS
    // ==============================

    const webcam = document.getElementById("webcam");

    const canvas = document.getElementById("canvas");

    const startCamera =
        document.getElementById("startCamera");

    const analyzeEmotion =
        document.getElementById("analyzeEmotion");

    const cameraStatus =
        document.getElementById("cameraStatus");

    const cameraPlaceholder =
        document.getElementById("cameraPlaceholder");

    const resultBox =
        document.getElementById("resultBox");

    const detectedEmotion =
        document.getElementById("detectedEmotion");

    const confidenceText =
        document.getElementById("confidenceText");


    // ==============================
    // CHECK IF CAMERA PAGE EXISTS
    // ==============================

    if (
        !webcam ||
        !canvas ||
        !startCamera
    ) {

        return;

    }


    let cameraStream = null;


    // ==============================
    // START CAMERA
    // ==============================

    startCamera.addEventListener(
        "click",
        async function () {

            try {


                // REQUEST CAMERA

                cameraStream =
                    await navigator.mediaDevices.getUserMedia({

                        video: true,

                        audio: false

                    });


                // SHOW CAMERA

                webcam.srcObject =
                    cameraStream;


                webcam.style.display =
                    "block";


                // HIDE PLACEHOLDER

                if (cameraPlaceholder) {

                    cameraPlaceholder.style.display =
                        "none";

                }


                // UPDATE BUTTON

                startCamera.textContent =
                    "Camera Active ✓";


                startCamera.disabled =
                    true;


                // UPDATE STATUS

                if (cameraStatus) {

                    cameraStatus.textContent =
                        "Camera is active. You can now analyze your facial expression.";

                }


                // SHOW ANALYZE BUTTON

                if (analyzeEmotion) {

                    analyzeEmotion.style.display =
                        "inline-block";

                }


            }

            catch (error) {


                console.error(
                    "Camera Error:",
                    error
                );


                if (cameraStatus) {

                    cameraStatus.textContent =
                        "Unable to access camera. Please allow camera permission.";

                }

            }

        }

    );


    // ==============================
    // ANALYZE EMOTION
    // ==============================

    if (analyzeEmotion) {


        analyzeEmotion.addEventListener(
            "click",
            function () {


                // ==============================
                // ANALYZE AGAIN → REFRESH PAGE
                // ==============================

                if (
                    analyzeEmotion.textContent.includes(
                        "Analyze Again"
                    )
                ) {

                    // STOP CAMERA BEFORE RELOADING

                    if (cameraStream) {

                        cameraStream
                            .getTracks()
                            .forEach(
                                track => track.stop()
                            );

                    }


                    // LOAD FRESH ANALYZE PAGE

                    window.location.href =
                        "/analyze";


                    return;

                }


                // ==============================
                // CHECK CAMERA
                // ==============================

                if (!webcam.srcObject) {

                    if (cameraStatus) {

                        cameraStatus.textContent =
                            "Please start the camera first.";

                    }

                    return;

                }


                // ==============================
                // CAPTURE CAMERA FRAME
                // ==============================

                canvas.width =
                    webcam.videoWidth;


                canvas.height =
                    webcam.videoHeight;


                const context =
                    canvas.getContext("2d");


                context.drawImage(

                    webcam,

                    0,

                    0,

                    canvas.width,

                    canvas.height

                );


                // ==============================
                // STATUS
                // ==============================

                if (cameraStatus) {

                    cameraStatus.textContent =
                        "MoodVision AI is analyzing your expression...";

                }


                analyzeEmotion.textContent =
                    "Analyzing...";


                analyzeEmotion.disabled =
                    true;


                // ==============================
                // CONVERT IMAGE TO BASE64
                // ==============================

                const imageData =
                    canvas.toDataURL(
                        "image/jpeg"
                    );


                // ==============================
                // SEND IMAGE TO FLASK
                // ==============================

                fetch(
                    "/detect-emotion",
                    {

                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        body:
                            JSON.stringify({

                                image:
                                    imageData

                            })

                    }

                )


                // ==============================
                // GET RESPONSE
                // ==============================

                .then(
                    response =>
                        response.json()
                )


                .then(
                    data => {


                        // ==============================
                        // SUCCESS
                        // ==============================

                        if (data.success) {


                            // SHOW RESULT BOX

                            if (resultBox) {

                                resultBox.style.display =
                                    "flex";

                            }


                            // SHOW EMOTION

                            if (detectedEmotion) {

                                detectedEmotion.textContent =
                                    data.emotion;

                            }


                            // SHOW CONFIDENCE

                            if (confidenceText) {

                                confidenceText.textContent =
                                    "Confidence: " +
                                    data.confidence +
                                    "%";

                            }


                            // UPDATE STATUS

                            if (cameraStatus) {

                                cameraStatus.textContent =
                                    "✓ Analysis complete! Emotion detected successfully.";

                            }


                            // CHANGE BUTTON

                            analyzeEmotion.textContent =
                                "Analyze Again ✨";


                            analyzeEmotion.disabled =
                                false;


                        }


                        // ==============================
                        // ERROR FROM SERVER
                        // ==============================

                        else {


                            if (cameraStatus) {

                                cameraStatus.textContent =
                                    "Analysis failed: " +
                                    data.error;

                            }


                            analyzeEmotion.textContent =
                                "Analyze Emotion ✨";


                            analyzeEmotion.disabled =
                                false;

                        }


                    }

                )


                // ==============================
                // NETWORK ERROR
                // ==============================

                .catch(
                    error => {


                        console.error(
                            "Emotion Detection Error:",
                            error
                        );


                        if (cameraStatus) {

                            cameraStatus.textContent =
                                "Unable to connect to the emotion analysis server.";

                        }


                        analyzeEmotion.textContent =
                            "Analyze Emotion ✨";


                        analyzeEmotion.disabled =
                            false;


                    }

                );


            }

        );

    }


});