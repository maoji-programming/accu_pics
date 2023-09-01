# accuenergy-pics

Developing with Vue 3 in Vite.

Task: Create a web page with the following features:
<ol>
    <li>A button to allow users to acquire their current location from their browser.
    <li>A search module that lets users input the name of a location. The search feature is triggered by both button clicks and pressing the enter key on the keyboard.
    <li>Display the location on a map and add a marker to each searched location every time the location changes.
    <li>A table with pagination to show all searched places:<ol>
        <li>Display a maximum of 10 records on each page.</li>
        <li>A checkbox at the beginning of each row to let users select multiple records at the same time.</li>
        <li>A delete button on the top to remove all selected records as well as their markers on the map.</li>
    </ol></li>
    <li>Display the time zone and local time of the latest searched location.</li>
</ol>

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin).

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

### Add API Key

create the .env file in root directory which the content should be
```
VITE_GOOGLE_MAP_API_KEY="the google map api key"


```
