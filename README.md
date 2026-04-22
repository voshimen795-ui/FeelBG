# Production Deployment Guide for FeelBG

## Overview
This guide provides instructions for setting up and deploying the FeelBG project in a production environment.

## Prerequisites
- A web server (e.g., Apache)
- PHP installed on the server
- Database setup with necessary credentials

## Setting Up
1. **Clone the Repository**:  
   Run the following command to clone the repository:  
   ```bash
   git clone https://github.com/<owner>/FeelBG.git
   cd FeelBG
   ```  

2. **Install Dependencies**:  
   Use composer to install dependencies:  
   ```bash
   composer install
   ```  

3. **Configuration**:  
   Update the `.env` file with your production database and environment settings. 
   
4. **Database Migration**:  
   Run database migrations:
   ```bash
   php artisan migrate --force
   ```  

## Deployment

1. **Upload Files**:  
   Upload all files to your production server.  

2. **Configure Apache**: 
   Ensure Apache is configured to serve the application directory.
   
3. **Set Permissions**:  
   Adjust file permissions:  
   ```bash
   chown -R www-data:www-data /path/to/FeelBG  
   chmod -R 755 /path/to/FeelBG
   ```  

## Maintenance
- Check server logs for any errors.
- Regular updates of dependencies and security patches.

## Troubleshooting
- Ensure the database connection is configured correctly.
- Review Apache error logs for any issues.

---  
**Last Updated:** 2026-04-22 19:32:19 UTC  

---  
**Author:** voshimen795-ui