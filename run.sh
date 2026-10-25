#!/bin/bash

# Run start command for the frontend folder
cd frontend
npm start &

# Run start command for the backend folder
cd ../backend
npm run dev &