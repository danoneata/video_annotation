# Video annotation

Annotation tool for videos

## Setting up

**Requirements.**
You'll need the following installed on your system:

* Python 3
* `virtualenv`
* `npm`
* PostgreSQL

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

Create the database:

```bash
# Create a new user
sudo -u postgres createuser -s annotator
# Create a new database
createdb -U annotator annotations_db
# Set the URL to the database as a system variable
export DATABASE_URL="postgresql://annotator@localhost/annotations_db"
# Create the tables
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
