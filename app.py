from flask import Flask, render_template, request, jsonify
from deepface import DeepFace
import base64
import numpy as np
import cv2


app = Flask(__name__)


# ==========================
# WEBSITE ROUTES
# ==========================

@app.route("/")
def home():
    return render_template("index.html")


@app.route("/analyze")
def analyze():
    return render_template("analyze.html")


@app.route("/about")
def about():
    return render_template("about.html")


# ==========================
# EMOTION ANALYSIS API
# ==========================

@app.route("/detect-emotion", methods=["POST"])
def detect_emotion():

    try:

        # GET IMAGE FROM JAVASCRIPT

        data = request.get_json()

        image_data = data.get("image")


        # CHECK IMAGE

        if not image_data:

            return jsonify({
                "success": False,
                "error": "No image received."
            })


        # REMOVE BASE64 HEADER

        image_data = image_data.split(",")[1]


        # DECODE IMAGE

        image_bytes = base64.b64decode(image_data)


        # CONVERT TO NUMPY ARRAY

        image_array = np.frombuffer(
            image_bytes,
            dtype=np.uint8
        )


        # CONVERT TO OPENCV IMAGE

        image = cv2.imdecode(
            image_array,
            cv2.IMREAD_COLOR
        )


        # CHECK IMAGE

        if image is None:

            return jsonify({
                "success": False,
                "error": "Unable to read image."
            })


        # ANALYZE EMOTION

        result = DeepFace.analyze(

            image,

            actions=["emotion"],

            enforce_detection=False

        )


        # DEEPFACE MAY RETURN LIST

        if isinstance(result, list):

            result = result[0]


        # GET DOMINANT EMOTION

        emotion = result["dominant_emotion"]


        # GET CONFIDENCE

        confidence = result["emotion"][emotion]


        # GET ALL EMOTION SCORES

        emotions = result["emotion"]


        # FORMAT SCORES

        emotion_scores = {

            "angry": round(
                float(emotions.get("angry", 0)),
                2
            ),

            "disgust": round(
                float(emotions.get("disgust", 0)),
                2
            ),

            "fear": round(
                float(emotions.get("fear", 0)),
                2
            ),

            "happy": round(
                float(emotions.get("happy", 0)),
                2
            ),

            "sad": round(
                float(emotions.get("sad", 0)),
                2
            ),

            "surprise": round(
                float(emotions.get("surprise", 0)),
                2
            ),

            "neutral": round(
                float(emotions.get("neutral", 0)),
                2
            )

        }


        # RETURN RESULT

        return jsonify({

            "success": True,

            "emotion": emotion.capitalize(),

            "confidence": round(
                float(confidence),
                2
            ),

            "all_emotions": emotion_scores

        })


    except Exception as error:

        print(
            "Emotion Detection Error:",
            error
        )

        return jsonify({

            "success": False,

            "error": str(error)

        })


# ==========================
# RUN APPLICATION
# ==========================

if __name__ == "__main__":

    app.run(
        debug=True
    )