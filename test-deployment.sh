#!/bin/bash

# Test deployment script

echo "Testing BizManager deployment..."

# Test if the application is running
echo "Checking if application is accessible..."
curl -f http://localhost:3000/api/health || echo "Application not accessible on port 3000"

# Test database connectivity
echo "Checking database connectivity..."
# This would require more specific testing based on your setup

echo "Deployment test completed."