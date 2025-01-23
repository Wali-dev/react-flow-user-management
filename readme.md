# User Management Using react-flow UI 



## Overview
A RESTful full-stack service for a user management application built with React+Typescript, react-flow, Node.js, Express, and MongoDB.


# Backend

## Prerequisites
- Node.js (v18+ recommended)
- MongoDB

## Tech Stack
- Express.js
- Mongoose
- express-validator
- cors
- dotenv
- uuid

## Installation

1. Clone the repository
```bash
git clone https://github.com/Wali-dev/react-flow-user-management
cd backend
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env` file in the root directory and add necessary configurations:
```
MONGODB_URI=your_mongodb_connection_string
PORT=8000
```

## Available Scripts
- `npm start`: Starts the server with nodemon for development
- `npm test`: Currently no tests specified

## API Endpoints

### Users

#### Get All Users
- **Method**: GET
- **URL**: `/api/v1/users`
- **Description**: Retrieves all user records

#### Create User
- **Method**: POST
- **URL**: `/api/v1/users`
- **Request Body**:
```json
{
    "username": "string",
    "age": "number",
    "hobbies": "string[]"
}
```

#### Update User
- **Method**: PATCH
- **URL**: `/api/v1/users/:id`
- **Description**: Updates an existing user by UUID
- **Request Body**: Same as create user

#### Delete User
- **Method**: DELETE
- **URL**: `/api/v1/users/:id`
- **Description**: Deletes a user by UUID

## Development
- Uses nodemon for automatic server restarts during development
- Implements basic CRUD operations for user management

# Frontend

## Prerequisites
- Node.js (v18+)
- npm or yarn

## Tech Stack
- React
- TypeScript
- Vite
- @xyflow/react (React Flow)
- Tailwind CSS
- DaisyUI
- Axios

## Features
- Drag-and-drop user and hobby management
- Visual node-based user interface
- Real-time API integration
- Hobby search and filtering
- User CRUD operations

## Setup

1. Go to frontend
```bash
cd frontend
```

2. Install dependencies
```bash
npm install
```

3. Create `.env` file
```bash
VITE_API_URL_V1=http://localhost:8000/api/v1/
```

## Available Scripts
- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run lint`: Run ESLint
- `npm run preview`: Preview production build

## Environment Configuration
Requires `VITE_API_URL_V1` to point to backend API endpoint

## Key Components
- `Flow.tsx`: Main application logic and React Flow visualization
- `Sidebar.tsx`: Hobby search and drag-and-drop interface
- `DnDContext.tsx`: Drag-and-drop context management

## Contributing
1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## License
ISC License