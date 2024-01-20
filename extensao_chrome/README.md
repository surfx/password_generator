# Extensão Chrome

Renomear o ícone para "hello_extensions.png", igual ao manifest

## Para adicionar a extensão ao Chrome

1. No navegador acesse: `chrome://extensions`
2. Acesse o `Modo de desenvolvedor`
3. Clique em `Carregar descompactado`

# Urls

- [Extensão Hello World](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world?hl=pt-br)
- [icon](https://storage.googleapis.com/web-dev-uploads/image/WlD8wC6g8khYWPJUsQceQkhXSlv1/gmKIT88Ha1z8VBMJFOOH.png)
- [chrome-types](https://www.npmjs.com/package/chrome-types)
- [Formato do arquivo de manifesto](https://developer.chrome.com/docs/extensions/reference/manifest?hl=pt-br)
- [Publicar na Chrome Web Store](https://developer.chrome.com/docs/webstore/publish?hl=pt-br)
- [Tutorial 1](https://www.freecodecamp.org/news/building-chrome-extension/)
- [api covid BR](https://covid19-brazil-api-docs.vercel.app)
- [svgviewer](https://www.svgviewer.dev)
- [SVG to CSS converter](https://www.svgbackgrounds.com/tools/svg-to-css/)

## Tips

- [save information locally](https://stackoverflow.com/questions/5364062/how-can-i-save-information-locally-in-my-chrome-extension)


### Examples

```
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">

<div class="container mt-3" style="width: 450px;">
        <h2 class="text-center">Covid Latest Report-UK</h2>
    <table class="table table-bordered">
        <thead>
        <tr>
            <th>Data</th>
            <th>Estado</th>
            <th>Confirmados</th>
            <th>Mortes</th>
        </tr>
        </thead>
        <tbody>
        <tr>
            <td id="date"></td>
            <td id="areaName"></td>
            <td id="latestBy"></td>
            <td id="deathNew"></td>
        </tr>
        </tbody>
    </table>
</div>

<script src="scripts/corona_script.js"></script>
```

# Extensão

<img src="..\assets\extensao_chrome.png" alt="Password Generator">