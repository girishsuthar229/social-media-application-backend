## Project setup
🚀 Linking You to the World – Backend API
NestJS + TypeScript + PostgreSQL
<p align="center"> <a href="https://nestjs.com/" target="blank"> <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /> </a> </p> <p align="center">A scalable and secure backend API built using <a href="https://nestjs.com" target="_blank">NestJS</a> for the Instagram-style social media platform: <b>“Linking You to the World”</b>.</p> <p align="center"> <a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" /></a> <a href="LICENSE" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" /></a> <a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" /></a> <a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" /></a> </p>
📌 Project Overview

This backend powers the social media application Linking You to the World, built to behave similarly to social media application.

It is responsible for:
Authentication (OTP, JWT) ,
User profiles , 
Posts (uploads, captions) , 
Likes & comments , 
Follows / unfollows , 
Secure PostgreSQL data storage , 
Clean modular NestJS architecture

🌐 Connected Frontend

👉 Frontend Repository:
https://github.com/girishsuthar229/social-media-application-frontend

👉 Live Frontend URL:
https://social-media-application-frontend.onrender.com/sign-in

This backend exposes APIs consumed by the above frontend.

🛠 Tech Stack

NestJS — Modular and scalable Node.js framework

TypeScript — Type-safe backend development

PostgreSQL — Main database

TypeORM — ORM for database modeling

JWT Authentication

Render / AWS / Railway (deployment ready)

📁 Folder Structure
src/
├── auth/
├── user/
├── posts/
├── comments/
├── likes/
├── followers/
├── database/
├── common/
└── main.ts

⚙️ Environment Variables : Create a .env file:


📦 Project Setup : Install dependencies:  npm install


▶️ Run the Backend

Development : npm run start:dev
Production : npm run start:prod


🗄️ Database Setup (PostgreSQL)
To generate tables: npm run typeorm:migration:run

🚀 Deployment::

1. Build the project:npm run build

2. Set environment variables on the hosting platform.

3. Start the server: node dist/main.js


NestJS Deployment Docs : https://docs.nestjs.com/deployment

🔗 Project Connections
Component	Technology	Repository / URL

Frontend	Next.js + TypeScript :	https://github.com/girishsuthar229/social-media-application-frontend


Backend	NestJS + PostgreSQL	This repository : Live Frontend	Render	https://social-media-application-frontend.onrender.com/sign-in


👨‍💻 Author

Girish Suthar
Full Stack Developer (Next.js + NestJS)
Focused on clean architecture, scalable features, and professional coding practices.