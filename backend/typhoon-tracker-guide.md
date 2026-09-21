# How to Use Typhoon Tracker

## Main Feature: Typhoon Prediction

Typhoon Tracker offers two modes for generating typhoon track predictions: **Manual** and **Automatic**.

---

## Manual Mode

Follow these steps to manually input a typhoon route for prediction:

1. **Select database**
   Choose from: `Default`, `JTWC`, `JMA`, `CMA`, `HKO`, `IMD`, `KMA`

2. **Select neighbors**
   Determines how many historical typhoons will be weighted and averaged to predict the typhoon track.

3. **Select type of model**
   Choose from: `KNN`, `Nearest-Centroid`, `Random Forest`
   *(Each model type is explained in the app to help you choose the best fit.)*

4. **Define year range**
   Select a range between `1884–2026`.

5. **Manually input coordinates**
   Enter latitude, longitude, and the time gap for each point.
   - **Time gap** refers to the difference in duration between consecutive coordinates. For example, if the first coordinate was reported at 12:00 and the next at 18:00, the time gap is `6` (hours).
   - The **first coordinate does not require a time gap**.

6. **Add new point**
   Use this option if you need to input more than one coordinate.

7. **Submit route**
   Finalize and submit your manually built typhoon route for prediction.

---

## Automatic Mode

Follow these steps to generate a prediction using an active typhoon:

1. **Select database**
   Choose from: `Default`, `JTWC`, `JMA`, `CMA`, `HKO`, `IMD`, `KMA`

2. **Select neighbors**
   Determines how many historical typhoons will be weighted and averaged to predict the typhoon track.

3. **Select type of model**
   Choose from: `KNN`, `Nearest-Centroid`, `Random Forest`
   *(Each model type is explained in the app to help you choose the best fit.)*

4. **Define year range**
   Select a range between `1884–2026`.

5. **Select an active typhoon**
   Choose a typhoon that is currently active near or within the **Philippine Area of Responsibility (PAR)**.

6. **Customize coordinates (optional)**
   You can customize which coordinates from the chosen active typhoon are used as input for the prediction.

7. **Submit route**
   Finalize and submit the route for prediction.

---

## Additional Features

### Typhoon Database
- Filter typhoons listed in the database.
- Click on any typhoon to display its recorded track.
