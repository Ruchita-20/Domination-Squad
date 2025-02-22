from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import firebase_admin
from firebase_admin import credentials, db
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from datetime import datetime

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for Next.js frontend

# Firebase setup
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://switchxpert-default-rtdb.firebaseio.com/'  # Replace with your database URL
})

# Load dataset
df = pd.read_csv('smart_home_bill_data.csv')

# Prepare data
X = df[['Fan Usage Time (hours)', 'Bulb Usage Time (hours)', 'Bell Usage Time (hours)', 'Socket Usage Time (hours)']]
y = df['Bill Generated (INR)']
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train model
model = LinearRegression()
model.fit(X_train, y_train)

# API Endpoint to get bill prediction based on selected date
@app.route('/predict', methods=['GET'])
def predict_bill():
    # Get the selected date from the frontend (default to today's date if not provided)
    selected_date = request.args.get('date', datetime.today().strftime('%Y-%m-%d'))

    print(f"Received request for date: {selected_date}")  # Debugging

    # Fetch appliance usage data for the selected date from Firebase
    ref = db.reference(f"/usage/{selected_date}/")
    data = ref.get()

    print(f"Fetched data for {selected_date}: {data}")  # Debugging print

    # Check if data is available for the selected date
    if not data:
        return jsonify({"error": f"No data found for {selected_date}"}), 400

    # Validate and extract appliance usage values
    try:
        fan_usage = float(data.get('Fan', 0))
        bulb_usage = float(data.get('Bulb', 0))
        bell_usage = float(data.get('Bell', 0))
        socket_usage = float(data.get('Socket', 0))
    except ValueError:
        return jsonify({"error": "Invalid data format in Firebase"}), 400

    # Prepare input data for prediction
    new_input = pd.DataFrame([{
        'Fan Usage Time (hours)': fan_usage,
        'Bulb Usage Time (hours)': bulb_usage,
        'Bell Usage Time (hours)': bell_usage,
        'Socket Usage Time (hours)': socket_usage,
    }])

    print("Input data for prediction:", new_input)  # Debugging print

    # Predict bill
    predicted_bill = model.predict(new_input)[0]
    print(f"Predicted Bill for {selected_date}: {predicted_bill}")  # Debugging print

    return jsonify({
        "selected_date": selected_date,
        "predicted_bill": round(predicted_bill, 2)  # Return rounded bill
    })

# Run the Flask server
if __name__ == '__main__':
    app.run(debug=True)
