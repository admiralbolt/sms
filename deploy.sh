#!/bin/bash

git_base=/home/admiralbolt/git/sms/
deployment_base=/home/admiralbolt/deployments/
today=$(date '+%Y-%m-%d_%H%M%S')

# 0. Pull the latest changes! (forgot about this...)
eval $(ssh-agent -s)
ssh-add ~/.ssh/git_rsa
cd $git_base
git pull

# 1. Create a new dated directory to put the deployment in.
mkdir $deployment_base/$today

# 2. Copy all backend files over to the deployment folder.
#    IDK why I thought renaming it to backend was a good idea.
cp -r $git_base/sms_server $deployment_base/$today/sms_backend
cp $deployment_base/latest/sms_backend/db.sqlite3 $deployment_base/$today/sms_backend/db.sqlite3
cp $deployment_base/latest/sms_backend/sms_server/local_settings.py $deployment_base/$today/sms_backend/sms_server/local_settings.py
# And make the logs folder!
mkdir $deployment_base/$today/sms_backend/logs

# Activate virtualenv.
echo $deployment_base/venv/bin/activate
source $deployment_base/venv/bin/activate
# Make sure requirements are up to date!
pip install -r $git_base/sms_server/requirements.txt
cd $deployment_base/$today/sms_backend/
# Collect static files.
python manage.py collectstatic --noinput
# Run migrations.
python manage.py migrate

# 3. Create a build of the frontend, then copy it to deployment folder.
cd $git_base/sms_frontend
npm install
npm run build
cp -r $git_base/sms_frontend/build $deployment_base/$today/sms_frontend

# 5. Update latest symlink to point to todays date.
ln -sfn $deployment_base/$today $deployment_base/latest

# 6. Restart all the service!
sudo systemctl restart celerybeat
sudo systemctl restart celeryd
sudo service uwsgi restart
sudo service nginx restart
