from flask import Flask, render_template, request, redirect, flash, url_for
from flask_sqlalchemy import SQLAlchemy
import qrcode
import os
from datetime import datetime

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SECRET_KEY'] = 'supersecretkey'
db = SQLAlchemy(app)

class URL(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    long_url = db.Column(db.String(2048), nullable=False)
    short_code = db.Column(db.String(6), unique=True, nullable=False)
    clicks = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
@app.context_processor
def inject_year():
    return dict(current_year=datetime.utcnow().year)

def generate_short_code():
    return os.urandom(3).hex()

@app.route('/', methods=['GET', 'POST'])
def home():
    if request.method == 'POST':
        long_url = request.form['long_url']
        custom_code = request.form.get('custom_code')

        if custom_code:
            existing_url = URL.query.filter_by(short_code=custom_code).first()
            if existing_url:
                flash('Custom short code already exists!', 'danger')
                return redirect(url_for('home'))
            short_code = custom_code
        else:
            short_code = generate_short_code()

        new_url = URL(long_url=long_url, short_code=short_code)
        db.session.add(new_url)
        db.session.commit()

        # Generate QR Code
        generate_qr_code(short_code)

        return render_template('result.html', short_url=request.host_url + short_code, short_code=short_code)

    return render_template('home.html')
@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/<short_code>')
def redirect_to_long_url(short_code):
    url = URL.query.filter_by(short_code=short_code).first_or_404()
    url.clicks += 1  # Increment click counter
    db.session.commit()
    return redirect(url.long_url)

@app.route('/analytics/<short_code>')
def analytics(short_code):
    url = URL.query.filter_by(short_code=short_code).first_or_404()
    return render_template('analytics.html', url=url)

def generate_qr_code(short_code):
    qr = qrcode.make(request.host_url + short_code)
    qr.save(os.path.join('static/qrcodes', f'{short_code}.png'))




@app.route('/contact', methods=['GET', 'POST'])
def contact():
    if request.method == 'POST':
        name = request.form['name']
        email = request.form['email']
        message = request.form['message']
        # Handle the form submission (store in DB or send email, etc.)
        print(f"Message from {name} ({email}): {message}")
        return redirect(url_for('home'))
    return render_template('contact.html')
@app.route('/terms')
def terms():
    return render_template('terms.html')

@app.route('/privacy')
def privacy():
    return render_template('privacy.html')

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True,host="0.0.0.0",port=5000)
