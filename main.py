
import io
import json
import logging
import os
import pdb
import traceback
import sys
import math 

from flask_sqlalchemy import SQLAlchemy

import sqlalchemy

from sqlalchemy import update

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

import scipy.io 

app = Flask(__name__)
app.config.from_object('config.Config')
db.init_app(app)

config.fileConfig('logger.conf')
logger = logging.getLogger('video_annotation')

login_manager = LoginManager()
login_manager.init_app(app)


FPS = 30


class LoginForm(Form):

    email = TextField("Email",  [Required(
        "Please enter your email address."), Email("Please enter your email address.")])
    password = PasswordField(
        'Password', [Required("Please enter a password.")])
    submit = SubmitField("Log in")

    def __init__(self, *args, **kwargs):
        Form.__init__(self, *args, **kwargs)

    def validate(self):
        user = User.query.filter_by(email=self.email.data.lower()).first()
        return user and user.check_password(self.password.data)


@app.route('/', methods=['GET'])
def index():
    if current_user.is_authenticated:
        return render_template("index.html", current_user=current_user)
    else:
        return redirect(url_for('login'))


@app.route('/login', methods=['GET', 'POST'])
def login():

    form = LoginForm()
    if request.method == 'POST':
        if form.validate():
            user = User.query.filter_by(email=form.email.data.lower()).first()
            login_user(user)
            flash('Welcome, {}!'.format(user.name), 'success')
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
                'sources': [
                    {
                        'src': video.src_mp4,
                        'type': 'video/mp4',
                    },
                ],
            }
            for video in Video.query.all()
        ]
    )


with open('vocabulary_child.txt', 'r') as f:
    VOCABULARY_CHILD = f.readlines()

with open('vocabulary_therapist.txt', 'r') as f:
    VOCABULARY_THERAPIST = f.readlines()    

ID_TO_WORD_CHILD = {i: word.strip() for i, word in enumerate(VOCABULARY_CHILD, 1)}
WORD_TO_ID_CHILD = {word: i for i, word in ID_TO_WORD_CHILD.items()}
ID_TO_WORD_THERAPIST = {i: word.strip() for i, word in enumerate(VOCABULARY_THERAPIST, 1)}
WORD_TO_ID_THERAPIST = {word: i for i, word in ID_TO_WORD_THERAPIST.items()}

@app.route('/vocabulary_child', methods=['GET'])
def get_vocabulary_child():
    data = [{'id': i, 'text': w} for i, w in ID_TO_WORD_CHILD.items()]
    return jsonify(data)
  
@app.route('/vocabulary_therapist', methods=['GET'])
def get_vocabulary_therapist():
    data = [{'id': i, 'text': w} for i, w in ID_TO_WORD_THERAPIST.items()]
    return jsonify(data)



@app.route('/js/<path:path>')
def send_js(path):
    return send_from_directory('www/js', path)


@app.route('/node_modules/<path:path>')
def send_js_2(path):
    return send_from_directory('node_modules', path)


@app.route('/css/<path:path>')
def send_css(path):
    return send_from_directory('www/css', path)


@app.route('/VideoData/<path:path>')
def send_data_videos(path):
    return send_from_directory('VideoData', path)


def shorten(description):
    MAX_LEN_DESCRIPTION = 35
    if len(description) > MAX_LEN_DESCRIPTION:
        return description[:MAX_LEN_DESCRIPTION] + ' [...]'
    else:
        return description
      
def  format_time(start_frame, end_frame):
   m_s = math.floor(start_frame/FPS/60)
   s_s = math.floor(start_frame/FPS) - m_s*60
   m_e = math.floor(end_frame/FPS/60)
   s_e = math.floor(end_frame/FPS) - m_e* 60
   result = "["+str(format(m_s,'02d'))+":"+str(format(s_s,'02d'))+"-"+str(format(m_e,'02d'))+":"+str(format(s_e,'02d'))+"]"
   return result


@app.route('/save_annotation',  methods=['GET', 'POST'])
def save_annotation():

   # if request.method == 'POST':
   # pdb.set_trace()
    try:
        start_frame = int(float(request.form['time_start']) * FPS)
        end_frame = int(float(request.form['time_end']) * FPS)
    except ValueError:
        start_frame = 0
        end_frame = 0
    
    description_type = int(request.form['description_type'])
    
    video_name = request.form["selected_video"]
    filter_child=request.form["filter_child"]
    filter_therapist=request.form["filter_therapist"]
    annotation = Annotation(
        description=request.form['description'],
        start_frame=start_frame,
        end_frame=end_frame,
        keywords_child=request.form['select_vocab_child'],
        keywords_therapist=request.form['select_vocab_therapist'],
        description_type=description_type,
        user=current_user,
        video=Video.query.filter(Video.name == video_name).first(),
    )

    ann_number = int(request.form["ann_number"])
    if ann_number == 0:
        db.session.add(annotation)
        db.session.commit()
        return_annotation = Annotation.query.filter((Annotation.user_id == current_user.id) and (
            Annotation.video_id == annotation.video.id)).order_by(sqlalchemy.desc(Annotation.id)).first()
    else:
        upd = (db.session.query(Annotation).filter(Annotation.id == ann_number).update(
            {"description": annotation.description, "start_frame": annotation.start_frame, "end_frame": annotation.end_frame, "keywords_child": annotation.keywords_child, "keywords_therapist": annotation.keywords_therapist, "description_type": annotation.description_type}))
        print("# of updated rows = {}".format(upd))
        db.session.commit()
        #last_annotation =  Annotation.query.filter((Annotation.user_id==current_user.id) & (Annotation.video_id == annotation.video.id)).order_by(sqlalchemy.desc(Annotation.id)).first()
        return_annotation = Annotation.query.filter((Annotation.id == ann_number) & (
            Annotation.video_id == annotation.video.id)).first()
    verify_filter = check_filter(return_annotation, filter_child, filter_therapist)
    #pdb.set_trace()
    return jsonify({
        "id": return_annotation.id,
        "short_description": shorten(return_annotation.description),
        "annotation_time": format_time(return_annotation.start_frame, return_annotation.end_frame),
        "verify_filter": verify_filter
    })

def check_filter(annot, filter_child, filter_therapist):
    ok = False
    for keyword_child in filter_child.split(", "):
     if keyword_child in annot.keywords_child:
        ok = True;
    for keyword_therapist in filter_therapist.split(", "):
     if keyword_therapist in annot.keywords_therapist:
        ok = True;    
    return ok


@app.route('/get_annotation',  methods=['GET', 'POST'])
def get_annotation():
    annotation_id = request.form["annotation_id"]
    annotation = Annotation.query.filter(Annotation.id == annotation_id).first()
    #pdb.set_trace();
    if annotation.keywords_therapist =='':
       selected_therapist  = ''
    else:
       selected_therapist = [str(WORD_TO_ID_THERAPIST[k]) for k in annotation.keywords_therapist.split(", ")]
       
    if annotation.keywords_child =='':
       selected_child  = ''
    else:
       selected_child = [str(WORD_TO_ID_CHILD[k]) for k in annotation.keywords_child.split(", ")]
    	 
    return jsonify({
        "t_start": annotation.start_frame / FPS,
        "t_end": annotation.end_frame / FPS,
        "description": annotation.description,
        "selected_vocab_child": selected_child,
        "selected_vocab_therapist": selected_therapist,
        "description_type":annotation.description_type,
    })


@app.route('/delete_annotation',  methods=['GET', 'POST'])
def delete_annotation():
    annotation_id = request.form["annotation_id"]
    upd = (db.session.query(Annotation).filter(
        Annotation.id == annotation_id).delete())
    print("# of deleted rows = {}".format(upd))
    db.session.commit()

    return "OK"


def row2dict(row):
    return {
        column.name: getattr(row, column.name)
        for column in row.__table__.columns
    }


@app.route('/get_all_annotations',  methods=['GET', 'POST'])
def get_all_annotations():
    video_name = request.args["selected_video"]
    video = Video.query.filter(Video.name == video_name).first()
    user = current_user
    # pdb.set_trace()
    annotation_list = Annotation.query.filter(
        (Annotation.user_id == current_user.id) &
        (Annotation.video_id == video.id)).order_by(sqlalchemy.asc(Annotation.id)).all()
    return jsonify([
        {
            'selected_video': video.name,
            'time_start': row.start_frame / FPS,
            'time_end': row.end_frame / FPS,
            'select_vocab_child': row.keywords_child,
            'select_vocab_therapist': row.keywords_therapist,
            'description': row.description,
            'description_type': row.description_type,
            'ann_number': row.id,
        }
        for row in annotation_list
    ])


@app.route('/export',  methods=['GET', 'POST'])
def export():
    btn = request.form["button_pressed"]
    if btn == '1':
        video_list = Video.query.all();
        for video in video_list:
            annotation_list = Annotation.query.filter(Annotation.video_id == video.id).order_by(sqlalchemy.asc(Annotation.start_frame)).all()
            split_list_child = [        annotation.keywords_child.split(', ')        for annotation in annotation_list    ]
            no  = 0
            classes_child = []
            for list in split_list_child:
                 
                 temp = [WORD_TO_ID_CHILD.get(action,-1) for action in list]
                 temp2= [[ 1 if i == xs - 1 else 0   for i in range(len(WORD_TO_ID_CHILD))   ]  for xs in temp]
                 classes_child.append([sum(x) for x in zip(*temp2)])
                 no=no+1

            split_list_therapist = [        annotation.keywords_therapist.split(', ')        for annotation in annotation_list    ]
            no  = 0
            classes_therapist = []
            for list in split_list_therapist:
                 
                 temp = [WORD_TO_ID_THERAPIST.get(action,-1) for action in list]
                 temp2 = [[ 1 if i == xs - 1 else 0   for i in range(len(WORD_TO_ID_THERAPIST))   ]  for xs in temp]
                 classes_therapist.append( [sum(x) for x in zip(*temp2)])
                 no=no+1
            
            #pdb.set_trace()              
            #classes_child = [ [ 1 if i == xs - 1 else 0   for i in range(len(WORD_TO_ID_CHILD))   ]  for xs in [        WORD_TO_ID_CHILD.get(annotation.keywords_child, -1)        for annotation in annotation_list    ] ]
            #classes_therapist = [ [   1 if i == xs - 1 else 0     for i in range(len(WORD_TO_ID_THERAPIST))    ]    for xs in [  WORD_TO_ID_THERAPIST.get(annotation.keywords_therapist, -1)        for annotation in annotation_list    ] ]
            #WORD_TO_ID_CHILD()
            #pdb.set_trace()
            scipy.io.savemat('/home/elisabeta/video_annotation/DataPerVideo/'+ video.name+'.mat', mdict={'start_frame': [annotation.start_frame for annotation in annotation_list], 'end_frame': [annotation.end_frame for annotation in annotation_list], 'description': [[annotation.description] for annotation in annotation_list], 'classes_child': classes_child, 'classes_therapist': classes_therapist, 'action_author': [annotation.description_type for annotation in annotation_list] })
    return 'OK'
            
    




@app.route('/annotations_list',  methods=['GET'])
def get_annotations_list():
    
    video_name = request.args.get("selected_video")
    #to_filter_undefined = request.args.get("to_filter_undefined", None)
    #to_filter_undefined = to_filter_undefined == "true"
    
    to_filter = request.args.get("to_filter", None)
    to_filter = to_filter == "true"
    #pdb.set_trace()
    filter_child=request.args.get("filter_child")
    filter_therapist=request.args.get("filter_therapist")
    #pdb.set_trace()
    #def filter_undefined_annots(annots):
    #    if not to_filter_undefined:
     #       return annots
     #   else:
      #      return (
       #         annot
        #        for annot in annots
        #        if 'Undefined' in annot.keywords_child or 'Undefined' in annot.keywords_therapist
         #   )
   # pdb.set_trace()
   
    def filter_annots(annots):
        if not to_filter or (filter_child == '' and filter_therapist== ''):
            return annots
        else:
          return_annots = []
          for annot in annots:
              ok = 0
              if filter_child:
                for keyword in filter_child.split(", "):
                    if keyword in annot.keywords_child:
                        ok = 1
              if filter_therapist:
                for keyword in filter_therapist.split(", "):
                    if keyword in annot.keywords_therapist:
                        ok = 1
              if ok==1:
                 return_annots.append(annot)
          return return_annots
            #return (
                #annot 
                #for annot in annots
                # for keyword in filter_child.split(", ")
                 #  if keyword in annot.keywords_child
                  # )
            
         
    video = Video.query.filter(Video.name == video_name).first()

    query = Annotation.query.filter(Annotation.user_id == current_user.id)
    query = query.filter(Annotation.video_id == video.id)
    query = query.order_by(sqlalchemy.asc(Annotation.id))

    annotations_list = query.all()
    #pdb.set_trace()
    return jsonify([
        {
            'id': row.id,
            'short_description': shorten(row.description),
            'annotation_time': format_time(row.start_frame, row.end_frame)
        }
        for row in filter_annots(annotations_list)
    ])


def _error_as_json(ex, status=500, trace=True):
    logger.error(" -- Got exception in the tagger backend!")
    logger.error(" -- %r" % ex)
    if trace:
        logger.error(traceback.format_exc())
    return json.dumps({'error': "{}".format(ex)}), status


if __name__ == '__main__':
    if len(sys.argv) > 1:
        port = int(sys.argv[1])
    else:
        port = 5152
    app.run(host='0.0.0.0', port=port, debug=True, threaded = True)
