
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

from flask.ext.login import (
    LoginManager,
    login_user,
    logout_user,
    current_user,
    login_required,
)

from flask.ext.wtf import Form

from wtforms import (
    PasswordField,
    SubmitField,
    TextField,
)

from wtforms.validators import (
    Email,
    Required,
)


app = Flask(__name__)
app.secret_key = 'imar'

config.fileConfig('logger.conf')
logger = logging.getLogger('video_annotation')

login_manager = LoginManager()
login_manager.init_app(app)


class User:
    def __init__(self, email, password, id):
        self.email = email
        self.password = password
        self.id = id 
   
    def get_id(self):
        return self.id

    @property
    def is_authenticated(self):
        return True

    @property
    def is_active(self):
        return True

    def check_password(self, password):
        return password == self.password


# TODO Hash passwords
users = [
    User('eli@imar.ro', 'marinoiu', 1),
    User('alin@imar.ro', 'popa', 2),
]


class LoginForm(Form):

    email = TextField("Email",  [Required("Please enter your email address."), Email("Please enter your email address.")])
    password = PasswordField('Password', [Required("Please enter a password.")])
    submit = SubmitField("Log in")

    def __init__(self, *args, **kwargs):
        Form.__init__(self, *args, **kwargs)

    def validate(self):
        # if not Form.validate(self):
        #     return False
        for user in users:
            if user.email == self.email.data:
                return user.check_password(self.password.data)
        return False


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
            for user in users:
                if user.email == form.email.data:
                    break
            login_user(user)
            flash('Welcome, {}!'.format(user.email), 'success')
            return redirect(url_for('index'))
        else:
            flash('Invalid email and/or password.', 'danger')
            return render_template('login.html', form=form)
    elif request.method == 'GET':
        return render_template('login.html', form=form)


@login_manager.user_loader
def load_user(id):
    for user in users:
        if user.get_id() == id:
            return user


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
def videos():
   json_data = open("videos.json").read()
   data = json.loads(json_data)
   return jsonify(data)
   
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
    path_app =  os.path.realpath('.')
    path_data = path_app+ "/AnnData/"
    path_user = path_data + str(current_user.get_id())
    path_video = path_user + "/" + request.form["selected_video"]
    if os.path.exists(path_app + '/AnnData') == False:
      os.mkdir(path_app + '/AnnData')
    if os.path.exists(path_user) == False:
       os.mkdir(path_user)
    if os.path.exists(path_video) == False:
       os.mkdir(path_video)
        
    
    
 
    current_annotations = os.listdir(path_video)
    current_annotations_ids = []; 
    #pdb.set_trace()
    if len(current_annotations)==0:
      current_ind = 1
    else:
       
      for k  in range(0,len(current_annotations)):
        current_annotations[k] = int(current_annotations[k][0:-5])
      current_ind = max(current_annotations)+1
    
    
    x = request.form.to_dict()
    z = {"email": current_user.email}
    f = open(path_video + "/" + str(current_ind).zfill(3)+'.json', 'w+')
    x.update(z);
    json.dump(x,f,  indent = 4)
    f.close()
        
    #if request.method == 'POST':
     #request.form["ann_id"] = current_ind;
       
    return 'OK' 

def _error_as_json(ex, status=500, trace=True):
    logger.error(" -- Got exception in the tagger backend!")
    logger.error(" -- %r" % ex)
    if trace:
        logger.error(traceback.format_exc())
    return json.dumps({'error': "{}".format(ex)}), status


if __name__ == '__main__':
    app.run('0.0.0.0', port=5152, debug=True)
