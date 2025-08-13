Hi this will be our epic autism test

## Customize
- **Axes & labels**: edit `AXES` in `app.js`.
- **Questions**: edit the `QUESTIONS` array in `questions.js`. Each item has:
  ```js
  { text: "Statement here", effect: { econ: 1, civil: -1 } }
  ```
  Positive weights push the **right** label, negative weights the **left** label.
- **Styling**: tweak `style.css`.

## How scoring works
- Each answer maps to a value from -2 (Strongly Disagree) .. 0 .. +2 (Strongly Agree).
- For each axis weight on the question, the score adds `weight * value`.
- The maximum possible magnitude per axis is the sum of `abs(weight) * 2` across all questions for that axis.
- Final percentages are normalized to 0–100 on each axis as **Left% vs Right%**.

## Shareable links
Results are encoded in the query string: `?r=<base64-json>`. Use the **Copy share link** button after finishing.

## Notes
- No backend required. Everything runs in the browser.
- Add more pages (about, methodology) if you want.
- If you publish a fork inspired by 8values, add credit where appropriate.
