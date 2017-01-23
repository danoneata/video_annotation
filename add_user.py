import argparse
import pdb

from flask import Flask

from flask_sqlalchemy import SQLAlchemy

from models import User


db = SQLAlchemy()


def main():

    parser = argparse.ArgumentParser(description='Adds user to the database.')
    parser.add_argument(
        '-n', '--name',
        required=True,
        help="Name",
    )
    parser.add_argument(
        '-e', '--email',
        required=True,
        help="Email",
    )
    parser.add_argument(
        '-p', '--password',
        required=True,
        help="Password",
    )
    args = parser.parse_args()

    app = Flask(__name__)
    app.config.from_object('config.Config')
    db.init_app(app)

    pdb.set_trace()

    with app.app_context():
        admin = User(args.name, args.email, args.password)
        db.session.add(admin)
        db.session.commit()



if __name__ == '__main__':
    main()
