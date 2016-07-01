
import io
import json
import logging
import os
import pdb
import traceback

from collections import namedtuple

from logging import config

from functools import wraps

from flask import (
    Flask,
    flash,
    jsonify,
    redirect,
    render_template,
    request,
    send_file,
    send_from_directory,
    url_for,
)

from flask_login import (
    LoginManager,
    login_user,
    logout_user,
    current_user,
    login_required,
)

from flask_wtf import Form

from wtforms import (
    PasswordField,
    SubmitField,
    TextField,
)

from wtforms.validators import (
    Email,
    Required,
)

from config import Config

from models import (
    db,
    Annotation,
    User,
    Video,
)

app = Flask(__name__)
app.config.from_object('config.Config')
db.init_app(app)

config.fileConfig('logger.conf')
logger = logging.getLogger('video_annotation')

login_manager = LoginManager()
login_manager.init_app(app)


class LoginForm(Form):

    email = TextField("Email",  [Required("Please enter your email address."), Email("Please enter your email address.")])
    password = PasswordField('Password', [Required("Please enter a password.")])
    submit = SubmitField("Log in")

    def __init__(self, *args, **kwargs):
        Form.__init__(self, *args, **kwargs)

    def validate(self):
        user = User.query.filter_by(email=self.email.data.lower()).first()
        return user and user.check_password(self.password.data)


@app.route('/', methods=['GET'])
def index():
    if current_user.is_authenticated:
        return render_template("index.html")
    else:
        return redirect(url_for('login'))


@app.route('/login', methods=['GET', 'POST'])
def login():
   
    form = LoginForm()
    if request.method == 'POST':
        if form.validate():
            user = User.query.filter_by(email=form.email.data.lower()).first()
            login_user(user)
            flash('Welcome, {}!'.format(user.email), 'success')
            return redirect(url_for('index'))
        else:
            flash('Invalid email and/or password.', 'danger')
            return render_template('login.html', form=form)
    elif request.method == 'GET':
        return render_template('login.html', form=form)


@login_manager.user_loader
def load_user(user_id):
    return User.query.filter(User.id == int(user_id)).first()


@app.route('/logout')
@login_required
def logout():
    logout_user()
    flash('You were logged out.', 'success')
    return redirect(url_for('index'))


@app.route('/profile')
@login_required
def profile():
    return render_template('profile.html')


@app.route('/videos', methods=['GET'])
@login_required
def get_videos_json():
    return jsonify(
        [
            {
                'name': video.name,
                'source/webm': video.src_webm,
                'source/mp4': video.src_mp4,
            }
            for video in Video.query.all()
        ]
    )

   
@app.route('/js/<path:path>')
def send_js(path):
    return send_from_directory('www/js', path)


@app.route('/css/<path:path>')
def send_css(path):
    return send_from_directory('www/css', path)


@app.route('/VideoData/<path:path>')
def send_data_videos(path):
    return send_from_directory('VideoData', path)



@app.route('/save_annotation',  methods=['GET','POST'])
def save_annotation():

    try:
        start_frame = int(float(request.form['time_start']))
        end_frame = int(float(request.form['time_end']))
    except ValueError:
        start_frame = 0
        end_frame = 0

    video_name = request.form["selected_video"]

    annotation = Annotation(
        description=request.form['description'],
        start_frame=start_frame,
        end_frame=end_frame,
        keywords=request.form['select_vocab'],
        user=current_user,
        video=Video.query.filter(Video.name == video_name).first(),
    )
    db.session.add(annotation)
    db.session.commit()
    
    return 'OK' 


def _error_as_json(ex, status=500, trace=True):
    logger.error(" -- Got exception in the tagger backend!")
    logger.error(" -- %r" % ex)
    if trace:
        logger.error(traceback.format_exc())
    return json.dumps({'error': "{}".format(ex)}), status


if __name__ == '__main__':
    app.run('0.0.0.0', port=5152, debug=True)
