from flask import Flask, render_template, request, jsonify
from predict import predict_placement, FEATURE_ORDER, NUMERIC_FEATURES, BINARY_FEATURES, BINARY_MAP

app = Flask(__name__)


@app.route("/")
def index():
    return render_template(
        "index.html",
        numeric_features=NUMERIC_FEATURES,
        binary_features=BINARY_FEATURES,
        binary_options=list(BINARY_MAP.keys()),
    )


@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json(force=True)
    try:
        result = predict_placement(data)
        return jsonify({"success": True, **result})
    except ValueError as e:
        return jsonify({"success": False, "error": str(e)}), 400


if __name__ == "__main__":
    app.run(debug=True, port=5000)
