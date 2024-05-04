# Live Chat App

This repository contains the source code for a real-time chat application built using Django, Django REST Framework (DRF), Channels, Redis, and React for the frontend. The app supports various features including seen indicators, typing status, customization options for color, theme, and background image, as well as user profile management.

## Features

- Real-time Communication: Utilizes Django Channels and WebSocket for instant messaging.
- User Interface: React frontend for an interactive and responsive user experience.
- Seen Indicator: Shows when messages have been viewed by recipients.
- Typing Indicator: Indicates when someone is typing a message.
- Customization: Users can customize chat interface with colors, themes, and background images.
- Profile Editing: Users can edit their avatar, display name, and bio.
- Message Management: Ability to edit and delete messages within a conversation.
- Search Functionality: Allows searching through conversations and contacts.

## Requirements
- Python (3.10+)
- Django (5.0.4)
- Django REST Framework (3.15.1)
- Django Channels (4.1.0)
- Redis (5.4.0)
- React (latest)
- Vite (latest)

## Installation
### Clone the repository:


```s
git clone https://github.com/ht21992/Live-Chat-Django-React.git
```
```s
cd Live-Chat-Django-React
```

### Backend Setup:
1. Create a virtual environment (optional but recommended):
```s
python -m venv env
source env/bin/activate  # Activate the virtual environment
```
2.Install Python dependencies:
```s
pip install -r requirements.txt
```
3-Apply migrations
```s
python manage.py migrate
```
4-Run the Django development server
```s
python manage.py runserver
```

### Frontend Setup:

1. Navigate to the frontend directory:
bash
```s
cd frontend
```

2. Install Node.js dependencies
```s
npm install
```

3. Start the React development server
```s
npm run dev
```

### Redis Setup:

1.Ensure Redis server is installed and running locally.

## Usage
Access the application in your web browser at http://localhost:5173.
Create a new account or log in with existing credentials.
Start messaging in real-time with other users.
Customize your chat interface and profile settings.


# App Images
![image](https://github.com/ht21992/BMI-Predictor---Machine-Learning-Model/assets/47816410/0b5944cc-ab8a-491c-b3f2-4c1a5d29bb56)
![image](https://github.com/ht21992/BMI-Predictor---Machine-Learning-Model/assets/47816410/4d2ce41c-53b6-41bf-9bd8-fa452e47d30c)
![image](https://github.com/ht21992/BMI-Predictor---Machine-Learning-Model/assets/47816410/05511525-1a45-44b7-89c7-0b555362d14b)
![image](https://github.com/ht21992/BMI-Predictor---Machine-Learning-Model/assets/47816410/72440ee9-5566-4afe-941e-5cc89cd67868)
![image](https://github.com/ht21992/BMI-Predictor---Machine-Learning-Model/assets/47816410/fe247760-4a25-4703-ab66-7997d472f03c)
![image](https://github.com/ht21992/BMI-Predictor---Machine-Learning-Model/assets/47816410/4996e911-83db-4a35-b14f-f033b5155149)
![image](https://github.com/ht21992/BMI-Predictor---Machine-Learning-Model/assets/47816410/eeffaf19-d2cb-4771-8440-da6879f7e078)
![image](https://github.com/ht21992/BMI-Predictor---Machine-Learning-Model/assets/47816410/3dd836fb-b186-42c6-8ac6-e60d67b5cbcc)
![image](https://github.com/ht21992/BMI-Predictor---Machine-Learning-Model/assets/47816410/950863ed-7733-4f84-80e8-ae6d4b8a3c7a)
