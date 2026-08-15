# Wealth Data Explorer

Wealth Data Explorer is an interactive 3D webpage that retrieves person and wealth information from Google Sheets.

The project is adapted from the Three.js CSS3D Periodic Table example. The original chemical-element data has been replaced with person records containing a country, age, photo, name, interest, and net worth.

## Live Website

[View the Wealth Data Explorer](https://JiaShin19.github.io/wealth-data-explorer/)

## Features

- Google OAuth authorization
- Data retrieved from Google Sheets
- 200 person records displayed as interactive 3D tiles
- Table, Sphere, Double Helix, and Grid arrangements
- Table arrangement of 20 columns by 10 rows
- Grid arrangement of 5 columns by 4 rows by 10 layers
- Tile colours assigned according to net worth
- Mouse controls for rotating and zooming the visualization
- Low-to-high net-worth colour legend

## Net-Worth Colours

Net worth is represented by the background, border, and shadow colour of each tile.

| Net Worth | Colour | Code |
| --- | --- | --- |
| Below $100,000 | Red | `#EF3022` |
| $100,000 to below $200,000 | Orange | `#FDCA35` |
| $200,000 and above | Green | `#3A9F48` |

## Google Sheet Structure

The Google Sheet contains the following columns:

| Column | Field |
| --- | --- |
| A | Name |
| B | Photo |
| C | Age |
| D | Country |
| E | Interest |
| F | Net Worth |

## Project Structure

```text
wealth-data-explorer/
├── index.html
├── main.css
├── config.js
├── auth.js
├── sheets.js
├── visualization.js
├── .gitignore
└── README.md
```

## File Responsibilities

- `index.html` contains the webpage structure, visualization buttons, colour legend, and Three.js import map.
- `main.css` contains the styles for the login page, tiles, buttons, and legend.
- `config.js` contains the Google OAuth and Google Sheet configuration.
- `auth.js` handles Google authorization.
- `sheets.js` retrieves and processes records from Google Sheets.
- `visualization.js` creates the person tiles and manages the four 3D arrangements.

## Technologies Used

- HTML
- CSS
- JavaScript
- Three.js
- Google Identity Services
- Google Sheets API
- GitHub Pages

## Running Locally

The project must be opened through a local web server because it uses JavaScript modules.

Using Visual Studio Code Live Server:

1. Open the project folder in Visual Studio Code.
2. Right-click `index.html`.
3. Select **Open with Live Server**.
4. Open the local address displayed by Live Server.

The Google account used to sign in must have permission to access the Google Sheet.

## Controls

- Drag the mouse to rotate the visualization.
- Use the mouse wheel to zoom in or out.
- Select **Table**, **Sphere**, **Helix**, or **Grid** to change the arrangement.

## Reference

The visualization is adapted from the Three.js CSS3D Periodic Table example:

- [Three.js CSS3D Periodic Table](https://threejs.org/examples/#css3d_periodictable)
- [Three.js repository](https://github.com/mrdoob/three.js)

## Author

Lee Jia Shin