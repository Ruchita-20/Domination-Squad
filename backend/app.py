from flask import Flask, jsonify
from flask_cors import CORS
import pandas as pd
import firebase_admin
from firebase_admin import credentials, db
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Allow requests from Next.js

# Firebase setup (Replace with your Realtime Database credentials)
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

# API Endpoint to get bill prediction
@app.route('/predict', methods=['GET'])
def predict_bill():
    # Fetch latest appliance data from Realtime Database
    ref = db.reference("/")  # Root reference
    data = ref.get()

    if not data:
        return jsonify({"error": "No data found"}), 400

    # Prepare input data for prediction
    new_input = pd.DataFrame([{
        'Fan Usage Time (hours)': 0,
        'Bulb Usage Time (hours)': data.get('bulb', {}).get('usage', 0),
        'Bell Usage Time (hours)': data.get('bell', {}).get('usage', 0),
        'Socket Usage Time (hours)': data.get('socket', {}).get('usage', 0),  # Adjust if socket data is available
    }])

    # Predict bill
    predicted_bill = model.predict(new_input)[0]

    return jsonify({"predicted_bill": predicted_bill})

if __name__ == '__main__':
    app.run(debug=True)