#!/bin/bash

# Setup script for Mental Health Practice Scheduling and Waitlist Management System
echo "Setting up development environment..."

# Create project directory structure
mkdir -p /home/ubuntu/mental-health-system/{backend,frontend,database,docs}
mkdir -p /home/ubuntu/mental-health-system/backend/{src,tests}
mkdir -p /home/ubuntu/mental-health-system/backend/src/{controllers,models,routes,services,middleware,utils,config}
mkdir -p /home/ubuntu/mental-health-system/frontend/{public,src}
mkdir -p /home/ubuntu/mental-health-system/frontend/src/{components,pages,services,utils,assets,hooks,context}
mkdir -p /home/ubuntu/mental-health-system/database/{migrations,seeds}

# Copy documentation to docs directory
cp /home/ubuntu/requirements_analysis.md /home/ubuntu/mental-health-system/docs/
cp /home/ubuntu/system_architecture.md /home/ubuntu/mental-health-system/docs/
cp /home/ubuntu/database_schema.md /home/ubuntu/mental-health-system/docs/
cp /home/ubuntu/api_endpoints.md /home/ubuntu/mental-health-system/docs/
cp /home/ubuntu/ui_ux_wireframes.md /home/ubuntu/mental-health-system/docs/

# Setup backend
cd /home/ubuntu/mental-health-system/backend
npm init -y
npm install express dotenv mongoose bcryptjs jsonwebtoken cors helmet morgan winston express-validator express-rate-limit cookie-parser compression

# Development dependencies for backend
npm install --save-dev nodemon jest supertest eslint prettier

# Create basic backend configuration files
echo '{
  "extends": ["eslint:recommended"],
  "env": {
    "node": true,
    "es6": true
  },
  "parserOptions": {
    "ecmaVersion": 2020
  },
  "rules": {
    "no-console": "warn"
  }
}' > .eslintrc.json

echo '{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}' > .prettierrc

echo 'node_modules
.env
coverage
logs
*.log
npm-debug.log*' > .gitignore

# Setup frontend with React
cd /home/ubuntu/mental-health-system/frontend
npm init -y
npm install react react-dom react-router-dom axios formik yup react-query styled-components @mui/material @mui/icons-material @emotion/react @emotion/styled chart.js react-chartjs-2 date-fns

# Development dependencies for frontend
npm install --save-dev vite @vitejs/plugin-react eslint eslint-plugin-react prettier

# Create basic frontend configuration files
echo '{
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended"
  ],
  "parserOptions": {
    "ecmaVersion": 2020,
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true
    }
  },
  "env": {
    "browser": true,
    "es6": true,
    "node": true
  },
  "settings": {
    "react": {
      "version": "detect"
    }
  },
  "rules": {
    "react/prop-types": "off"
  }
}' > .eslintrc.json

echo '{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}' > .prettierrc

echo 'node_modules
dist
.env
coverage
logs
*.log
npm-debug.log*' > .gitignore

# Setup database with PostgreSQL
cd /home/ubuntu/mental-health-system/database
npm init -y
npm install pg knex dotenv

# Development dependencies for database
npm install --save-dev jest

# Create basic database configuration files
echo 'node_modules
.env
coverage
logs
*.log
npm-debug.log*' > .gitignore

# Create main project package.json
cd /home/ubuntu/mental-health-system
echo '{
  "name": "mental-health-system",
  "version": "1.0.0",
  "description": "Mental Health Practice Scheduling and Waitlist Management System",
  "main": "index.js",
  "scripts": {
    "start": "cd backend && npm start",
    "dev:backend": "cd backend && npm run dev",
    "dev:frontend": "cd frontend && npm run dev",
    "test": "cd backend && npm test && cd ../frontend && npm test && cd ../database && npm test",
    "setup": "cd backend && npm install && cd ../frontend && npm install && cd ../database && npm install"
  },
  "keywords": [
    "mental-health",
    "scheduling",
    "waitlist",
    "healthcare"
  ],
  "author": "",
  "license": "ISC"
}' > package.json

echo "Development environment setup complete!"
