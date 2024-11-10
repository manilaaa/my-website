from flask import Flask, render_template, request, redirect, url_for, session, jsonify
from datetime import datetime, timedelta
import threading

app = Flask(__name__)
app.secret_key = 'your_secret_key'

# Simulated databases
users = {}
events = {}

@app.route('/')
def home():
    if 'username' in session:
        return render_template('home.html', username=session['username'])
    return render_template('home.html')

@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data['username']
    password = data['password']
    if username in users:
        return jsonify({"error": "User already exists"}), 400
    users[username] = password
    return jsonify({"success": "User signed up"}), 200

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data['username']
    password = data['password']
    if users.get(username) == password:
        session['username'] = username
        return jsonify({"success": "User logged in"}), 200
    return jsonify({"error": "Invalid credentials"}), 400

@app.route('/logout')
def logout():
    session.pop('username', None)
    return redirect(url_for('home'))

@app.route('/calendar', methods=['GET', 'POST'])
def calendar():
    if request.method == 'POST':
        event_name = request.form['event_name']
        event_date = request.form['event_date']
        events[event_name] = event_date
        notify_event(event_name, event_date)
        return redirect(url_for('calendar'))
    return render_template('calendar.html', events=events)

def notify_event(event_name, event_date):
    event_time = datetime.strptime(event_date, '%Y-%m-%dT%H:%M')
    notification_time = event_time - timedelta(minutes=30)

    def send_notification():
        now = datetime.now()
        if now >= notification_time:
            for user in users.keys():
                print(f"Notification to {user}: '{event_name}' starts soon!")

    threading.Thread(target=send_notification).start()

if __name__ == '__main__':
    app.run(debug=True)
from flask import Flask, render_template, request, redirect, url_for, session, jsonify

app = Flask(__name__)
app.secret_key = 'your_secret_key'

# Simulated database for users
users = {"testuser": "testpass"}  # Replace with your own user database

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data['username']
    password = data['password']
    if users.get(username) == password:
        session['username'] = username
        return jsonify({"success": "User logged in"}), 200
    return jsonify({"error": "Invalid credentials"}), 400

if __name__ == '__main__':
    app.run(debug=True)
