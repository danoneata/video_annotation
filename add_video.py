import argparse
import pdb

from flask import Flask

from flask_sqlalchemy import SQLAlchemy

from models import Video


db = SQLAlchemy()


def main():

    parser = argparse.ArgumentParser(description='Adds video to the database.')
    
    parser.add_argument(
        '-n', '--name',
        required=True,
        help="name",
    )
    parser.add_argument(
        '-mp4', '--src_mp4',
        required=True,
        help="mp4 path",
    )
    parser.add_argument(
        '-webm', '--src_webm',
        required=True,
        help="webm path",
    )
    args = parser.parse_args()

    app = Flask(__name__)
    app.config.from_object('config.Config')
    db.init_app(app)

    

    with app.app_context():
        #pdb.set_trace();
        video = Video(args.name,args.src_mp4, args.src_webm)
        db.session.add(video)
        db.session.commit()



if __name__ == '__main__':
    main()
