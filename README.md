# Todo Web Application

A modern Todo web application built with [Angular](https://angular.dev/) 20, PrimeNG, and TailwindCSS. This app allows users to manage tasks, categories, and subtasks with a clean, responsive UI.

## Features

- Add, update, and delete tasks
- Organize tasks by categories
- Manage subtasks for each task
- Mark tasks and subtasks as completed
- Responsive design using TailwindCSS
- UI components powered by PrimeNG

## Project Structure

```
src/
  app/
    models/           # TypeScript interfaces for data models
    pages/            # Main UI pages and components
    services/         # API service wrappers
    shares/           # Shared components and services
    interceptors/     # HTTP interceptors (e.g., auth)
    app.config.ts     # Angular application configuration
    app.ts            # Root Angular component
    ...
  environments/       # Environment-specific configs
  main.ts             # Application entry point
  styles.scss         # Global styles (TailwindCSS)
  index.html          # Main HTML file
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [Angular CLI](https://angular.dev/tools/cli)

### Installation

1. Clone the repository:
   ```sh
   git clone <your-repo-url>
   cd To-do-UI-main
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

### Running the Application

Start the development server:
```sh
npm start
```
Open [http://localhost:4200/](http://localhost:4200/) in your browser.

### Building for Production

```sh
npm run build
```
The production build will be in the `dist/` directory.

### Running Tests

To execute unit tests:
```sh
npm test
```

## API

The app communicates with a backend API. The base URL is configured in [`src/environments/environment.ts`](src/environments/environment.ts) for development and [`src/environments/environment.prod.ts`](src/environments/environment.prod.ts) for production.

## Technologies Used

- [Angular 20](https://angular.dev/)
- [PrimeNG](https://primeng.org/)
- [TailwindCSS](https://tailwindcss.com/)
- [RxJS](https://rxjs.dev/)

## License

This project is licensed under the MIT License.

---

Feel free to update this README with more details about deployment, contributing, or backend API documentation as needed.