# from flask import Flask   # Importing the Flask class from the flask module

# ap = Flask(__name__)  # to start program

# @ap.route('/')
# def home():
#     return "Welcome to the Home Page!"

# @ap.route('/about')
# def about():
#     return "This is the About Page. We like Python."

# @ap.route('/contact')
# def contact():
#     return "Contact us at support@example.com."

# @ap.route('/services')
# def services():
#     return "Our services: Web Dev, Data Science, and AI."

# @ap.route('/status')
# def status():
#     return "System Status: Online and running smoothly."

# @ap.route('/hello/<name>')
# def hello(name):
#     return f"Hello, {name}! Chello."

# if __name__ == '__main__':
#     ap.run(debug=True)



    # pip install flask  -> python install packages



from flask import Flask, request

app = Flask(__name__)

# 1. Home route allowing both GET and POST
@app.route('/', methods=['GET', 'POST'])
def home():
    if request.method == 'POST':
        return "POST request received at Home!"
    return "Welcome to the Home Page (GET)!"

# 2. About route - POST only
@app.route('/about', methods=['POST'])
def about():
    return "Data received at the About Page via POST."

# 3. Contact route - POST only
@app.route('/contact', methods=['POST'])
def contact():
    return "Your contact message has been sent via POST."

# 4. Services route - POST only
@app.route('/services', methods=['POST'])
def services():
    return "Service inquiry submitted via POST."

# 5. Status route - POST only
@app.route('/status', methods=['POST'])
def status():
    return "System pinged successfully via POST."

@app.route('/hello', methods=['POST'])
def hello():
    data = request.form.get('name')
    if not data:
        return 'Name is required in the POST data.', 400
    return f"Hello, {data}! Chello."


if __name__ == '__main__':
    app.run(debug=True)