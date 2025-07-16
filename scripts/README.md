# Workout Data Seeding Scripts

This directory contains scripts for seeding the database with test data.

## Seeding Workout Data

The `seed-workouts.js` script generates random workout entries for a specific user. 

### Prerequisites

1. Make sure your Convex backend is running:
   ```
   npx convex dev
   ```

2. Ensure the `NEXT_PUBLIC_CONVEX_URL` environment variable is set in your `.env` file.

### Running the Script

Run the script using:

```bash
npm run seed-workouts
```

### What the Script Does

- Creates 30 random workouts for the user ID specified in the script
- Distributes workouts across the last 90 days
- Includes a variety of muscle groups, exercises, sets, reps, and weights
- Generates realistic workout durations and notes

### Customization

You can modify the script to:
- Change the number of workouts generated
- Adjust the date range
- Modify the exercise library
- Change the user ID

### Output

The script will log each workout as it's created and provide a success message when complete.

If you encounter any errors, they will be displayed in the console. 