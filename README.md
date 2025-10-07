# 🎨 ArtRewards - Backend Assessment

<div align="center">

![Laravel](https://img.shields.io/badge/Laravel-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Bootstrap](https://img.shields.io/badge/Bootstrap-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white)

*A sophisticated Laravel backend for managing artist collections and artworks with Cloudinary integration*

[![Demo Video](https://img.youtube.com/vi/YOUR_VIDEO_ID/0.jpg)](https://drive.google.com/file/d/1K2GpXWAUN2Pph_49oJf1qjjrz9k53PJj/view?usp=sharing)

*🎥 Click the image above to watch the demo video*

</div>

## 📋 Table of Contents
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Screenshots](#-screenshots)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [Usage](#-usage)
- [Developer](#-developer)

## ✨ Features

### 🖼️ Collections Management
- ✅ **CRUD Operations** - Create, read, update, delete collections
- ✅ **Advanced Search** - Search across collections and artworks
- ✅ **Smart Sorting** - Sort by title, date, artwork count (A-Z, Z-A, newest, oldest)
- ✅ **Pagination** - 6 collections per page
- ✅ **Image Handling** - Cloudinary integration for cover images

### 🎨 Artwork Management
- ✅ **Flexible Relationships** - Many-to-many with collections
- ✅ **Rich Metadata** - Categories, subjects, materials, styles
- ✅ **Powerful Search** - Search by title, artist, category
- ✅ **Multiple Sort Options** - Title, date, price
- ✅ **Bulk Operations** - Add multiple artworks to collections

### 🚀 Technical Excellence
- ✅ **RESTful API** - Clean, consistent endpoints
- ✅ **Cloudinary Integration** - Professional image management
- ✅ **Validation & Error Handling** - Comprehensive input validation
- ✅ **OOP Principles** - Clean, maintainable code architecture
- ✅ **Frontend Integration** - Vanilla JavaScript with Bootstrap

## 🛠️ Tech Stack

### Backend
- **Laravel 10.x** - PHP Framework
- **MySQL** - Database
- **Cloudinary** - Image CDN
- **RESTful API** - API Architecture

### Frontend
- **Vanilla JavaScript** - No framework dependencies
- **Bootstrap 5** - Responsive UI
- **HTML5/CSS3** - Modern web standards

## 🚀 Quick Start

### Prerequisites
- PHP 8.1+
- Composer
- MySQL 5.7+
- Cloudinary Account

### Installation
```bash
# Clone the repository
git clone https://github.com/keroibrahem/artartrewards.git
cd artartrewards

# Install dependencies
composer install

# Setup environment
cp .env.example .env
php artisan key:generate

# Configure database and Cloudinary in .env
# Run migrations
php artisan migrate

# Start development server
php artisan serve