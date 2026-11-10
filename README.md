# Atlas — World Explorer

Open **index.html** in a modern browser. No installation, build step, network connection, or API key is required. All data and libraries are bundled locally.

Alternatively, with Node.js installed, run `npm start` in this folder and open http://127.0.0.1:4173. Stop the server with Ctrl+C.

## Explore

- Switch among GDP per capita, life expectancy, renewable electricity, and internet access.
- Hover or keyboard-focus countries for values; click or press Enter to select.
- Search for a country, with arrow-key and Enter support.
- Drag, pinch, scroll, or use zoom buttons. The crosshair resets the map.
- The sidebar includes metric rankings, percentile position, and comparison to the unweighted sample median.
- Download all sample values as CSV. Gray countries have missing sample values.
- Responsive layout stacks the country sidebar below the map on small screens. Reduced-motion preferences disable transitions.

## Data and boundaries

**All numeric values are synthetic demonstration data, not factual country statistics.** The 2024 reference year is illustrative. There is no live data service. Sample values are deterministic and included in `sample-data.json`; runtime values are in `data.js` as `window.ATLAS_DATA`. If replacing the data, update that array and adjust metric domains and labels in `app.js`. Missing values must be `null`.

Geography: Natural Earth via [World Atlas 2.0.2](https://github.com/topojson/world-atlas), 1:110m resolution. Antarctica is omitted from the map but retained in the export with missing metrics. Some small countries are absent at this resolution; country names and boundary conventions follow the dataset and do not express a political position.

GDP uses a logarithmic color scale. Other metrics use linear color scales. Summary statistics and rankings include available country and territory records, unweighted; no population weighting is applied. Values are synthetic independently across metrics and should not be interpreted as modeled correlations. High rankings are simply larger values, not a judgment of overall wellbeing.

## Files

- `index.html`, `style.css`, `app.js`: readable application source.
- `data.js`: bundled geometry and synthetic values, compatible with direct file opening.
- `sample-data.json`: reusable sample data.
- `vendor/`: bundled D3 7.9.0 and TopoJSON Client 3.1.0, with licenses.
- `server.cjs`: optional local static server using only Node built-ins.

Dependencies: [D3](https://github.com/d3/d3) (ISC), [TopoJSON Client](https://github.com/topojson/topojson-client) (ISC), and [World Atlas](https://github.com/topojson/world-atlas) (ISC). Natural Earth source data is public domain. See `vendor/` for license texts.

## South Africa provinces
The app now opens with nine outlined, color-coded provinces. Hover or keyboard-focus a province for a popup containing its name, capital, and a short fact. Click or tap to keep details in the sidebar. Back to world returns to the original metric explorer. Province colors are categorical and do not represent statistics.

Boundary attribution: OCHA ROSEA and South African Municipal Demarcation Board, distributed by geoBoundaries gbOpen (2020 boundaries), CC BY 3.0 IGO. Geometry was normalized for D3 and the Northern Cape spelling corrected. Original metadata is bundled in vendor/SA-BOUNDARIES-METADATA.json. Province details and geometry are bundled in provinces.geojson and province-data.js.

