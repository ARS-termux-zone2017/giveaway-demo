#!/bin/bash
echo "🚀 Giveaway Demo starting..."

# update + install node/npm if missing
if ! command -v node &> /dev/null
then
  echo "Node.js missing. Installing..."
  sudo apt update
  sudo apt install -y nodejs npm
fi

# install node modules
npm install

# run server
npm start
