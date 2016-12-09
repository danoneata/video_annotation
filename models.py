
import argparse
import getpass
import datetime
import os
import pdb

from flask import Flask

from flask_sqlalchemy import SQLAlchemy

from sqlalchemy import MetaData

from werkzeug import (
    check_password_hash,
    generate_password_hash,
)


db = SQLAlchemy()


class User(db.Model):

    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80))
    email = db.Column(db.String(120), unique=True)
    password_hash = db.Column(db.String(128))

    def __init__(self, name, email, password):
        self.name = name
        self.email = email
        self.set_password(password)

    def __repr__(self):
        return '<User %r>' % self.name

    @property
    def is_authenticated(self):
        return True

    @property
    def is_active(self):
        return True

    @property
    def is_anonymous(self):
        return False

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def get_id(self):
        return self.id


class Video(db.Model):

    __tablename__ = 'videos'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(30))
    src_mp4 = db.Column(db.String(100))
    src_webm = db.Column(db.String(100))

    def __init__(self, name, src_mp4, src_webm):
        self.name = name
        self.src_mp4 = src_mp4
        self.src_webm = src_webm

    def __repr__(self):
        return '<Video %s>' % self.name


class Annotation(db.Model):

    __tablename__ = 'annotations'

    id = db.Column(db.Integer, primary_key=True)

    start_frame = db.Column(db.Integer())
    end_frame = db.Column(db.Integer())

    description = db.Column(db.String(512))
    keywords = db.Column(db.String(512))

    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    user = db.relationship('User')

    video_id = db.Column(db.Integer, db.ForeignKey('videos.id'))
    video = db.relationship('Video')

    def __init__(self, description, start_frame, end_frame, keywords, user, video):
        self.description = description
        self.start_frame = start_frame
        self.end_frame = end_frame
        self.keywords = keywords
        self.user = user
        self.video = video

    def __repr__(self):
        return '<Annotation %d for "%s" by %s>' % (self.value, self.title, self.user.name)


def main():

    parser = argparse.ArgumentParser(
        description='Script to handle the creation and deletion of the tables.')
    parser.add_argument(
        '-t', '--todo',
        default=[],
        nargs='+',
        choices=('create', 'init', 'drop'),
        help="what operation to perform.")
    args = parser.parse_args()

    app = Flask(__name__)
    app.config.from_object('config.Config')
    db.init_app(app)

    if 'create' in args.todo:

        with app.app_context():

            db.create_all()
            db.session.commit()

    if 'init' in args.todo:

        with app.app_context():

            admin = User('Elisabeta', 'eli@imar.ro', '1988')

            db.session.add(admin)
            db.session.commit()

            videos = [
                Video(
                    name='session_1',
                    src_mp4="http://vjs.zencdn.net/v/oceans.mp4",
                    src_webm="http://vjs.zencdn.net/v/oceans.webm",
                ),
                Video(
                    name='session_2',
                    src_mp4='http://media.w3.org/2010/05/sintel/trailer.mp4',
                   src_webm='http://media.w3.org/2010/05/sintel/trailer.webm',
                ),
            ]

            path_app = os.path.realpath('.')
            path_video_mp4 = os.path.join(path_app, "VideoData", "MP4")
            path_video_webm = os.path.join(path_app, "VideoData", "WEBM")

            if os.path.exists(path_video_mp4) and os.path.exists(path_video_webm):
                videos_for_annotation = os.listdir(path_video_webm)

                for k in videos_for_annotation:
                    videos.append(
                        Video(
                            name=k[0: -5],
                            src_mp4="VideoData/MP4/" + k,
                            src_webm="VideoData/WEBM/" + k[0:-4] + 'webm',
                        )
                    )

            for video in videos:
                db.session.add(video)
            db.session.commit()

    if 'drop' in args.todo:

        with app.app_context():

            db.reflect()
            db.drop_all()


if __name__ == '__main__':
    main()
