# Video annotation

Annotation tool for videos

## Setting up

**Requirements.**
You'll need the following installed on your system:

* Python 3
* `virtualenv`
* `npm`
* PostgreSQL or MySQL


On Ubuntu you can install them as follows:

```bash
sudo apt-get install python3-dev
sudo apt-get install python-virtualenv
sudo apt-get install npm
sudo apt-get install postgresql postgresql-client postgresql-contrib
sudo apt-get install libpq-dev
```

Install the Python dependencies:

```bash
virtualenv -p python3 venv
source venv/bin/activate
pip install -r requirements.txt
```

Install the JavaScript dependencies:

```bash
npm install
```

Create the database (Postegres):

```bash
# Create a new user
sudo -u postgres createuser -s annotator
# Create a new database
createdb -U annotator annotations_db
# Set the URL to the database as a system variable
export DATABASE_URL="postgresql://annotator@localhost/annotations_db"
```

Create the database (MySQL):

```bash
# Create a new user
CREATE USER 'elisabeta'@'localhost' IDENTIFIED BY 'ann123'
# Create a new database
CREATE DATABASE annotations_db;
# Set the URL to the database as a system variable
export DATABASE_URL="mysql+pymysql://elisabeta:ann123@localhost/annotations_db";
```

Create the tables from Python:

```bash
python models.py --todo create init
```

You can connect to the database as follows:

```bash
psql -h localhost -p 5432 -d annotations_db -U annotator
```

Start the server:

```bash
python main.py
```

The webpage is accesible on the localhost [http://0.0.0.0:5152](http://0.0.0.0:5152).

## TODO

- [x] List videos in index page
- [x] On click change video to be displayed
- [x] List current annotations
- [x] Add new annotations
- [x] When adding a new annotation, automatically trim length of description
- [x] Add scroll to annotations
- [x] Reset controls when selecting another video
- [x] Check Chrome
- [x] Check why first option does not work in the select form
- [x] Initialize select form with existing tags
- [x] Fix time limits to either seconds or frames
- [x] After adjusting start time, gray out the slider and the pick start button + text input (Maybe add a button - 'Done'?!)
- [x] Select temporal limits in stages
- [x] Add a button to pick the current time
- [x] Are we storing frames or seconds as temporal limits? Python / MySQL expect frames; Javascript returns seconds
- [x] Add a button to play the current selection
- [X] Write "update annotation" on button when updatting
- [x] Put a constraint on the time limits to ensure that the end limit is always after the start one
- [ ] Don't delete anything from database, add an extra entry in the table that specify it should be ignored
- [ ] Replace videojs-playlist-ui with our own implementation
