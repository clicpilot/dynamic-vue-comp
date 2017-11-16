let HeadingJSON = {
    name:"Heading",
    defaultSettings: {
        text:"text"
    },
    template: `<div>
        <h1 v-html="settings.text"></h1>
        </div>
        `,
    control:{
            text: {input:'text'}
    }
}
