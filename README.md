### NOTE: testing AWS Amplify currently for FE hosting / integration with Github

# CoursePilot

CoursePilot is a web-based application designed to assist students in planning their academic path. Users can upload their transcript, review remaining degree requirements, and generate recommended course schedules based on their preferences.

---

## Tech Stack

- React (Frontend)
- Vite (Build Tool)
- TypeScript
- Vitest (Unit Testing)
- React Testing Library

---

## Setup Instructions

```bash
npm install

npm run dev

npm run test


src/
  pages/         # Main application pages (Login, Upload, Preferences, Results)
  components/    # Reusable UI components (e.g., DragDropBox, NavBar)
  services/      # API interaction logic (planningApi)
  test/          # Test setup configuration
```

## Unit Testing

Unit tests were implemented using Vitest and React Testing Library to validate both user interface behavior and service-layer logic.

Test coverage includes:

- Upload transcript workflow and UI behavior
- API request handling using mocked responses
- User interactions (button states, form inputs)
- Navigation and local storage updates
- Error handling scenarios


## Notes

- Backend services are currently mocked for Phase I
- Full backend integration and testing will be implemented in near future