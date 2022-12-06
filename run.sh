#!/bin/bash

anchor build
anchor deploy
sudo kill -9 $(sudo lsof -t -i:8899)
anchor test

