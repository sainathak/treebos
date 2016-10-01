#!/bin/bash
 

DJANGODIR=/home/ubuntu/treebos/ # Django project directory
ADDRESS=0.0.0.0
PORT=8000
 
echo "Starting Django Server"
source /home/ubuntu/dev/bin/activate
cd $DJANGODIR
python manage.py runserver
echo "Django Server running on $ADDRESS:$PORT"
