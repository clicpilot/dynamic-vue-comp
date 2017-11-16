let ArticleJSON = {
    name:"Article",
    defaultSettings: {
        head:"head",
        text:"text"
    },
    template: `<article>
        <h1 v-html="settings.head"></h1>
        <p v-html="settings.text"></p>
        </article>
        `,
    control:{
            head: {input:'text'},
            text: {input:'text'}
    }
}
