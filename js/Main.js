class Component{
    
    constructor(settings) {
        this.settings = settings;
    }
    
    getDefaultSettings() {
        return JSON.parse(JSON.stringify(this.settings))   
    }
    
    setStore(store) {
        this.store = store
    }
    
    getStore() {
        return this.store
    }

}


let Main = (function() {
    const componentClasses = {}
    
   

    const initVueApp = (el) => {

        Vue.component('app-pane', {
            template: `<div id="main-pane">
                            <div v-for="(comp, compIndex) in comps" v-on:click="toggleSelectComp(comp)" :class="'item-comp '+(selectedIdx===compIndex?'sel':'unsel')" :key="comp">
                                
                                    <component v-bind:is="comp.getCompName()" :props="comp.getStore()">
                                    </component>
                                <hr>
                            </div>
                        </div>
                        `,
            store:store,
            data:{
                
            },
            computed: {
                comps () {
                  return this.$store.state.comps
                },
                selectedIdx () {
                  return this.$store.state.selectedIdx
                },
                selectedComp() {
                    return this.$store.state.comps[this.$store.state.selectedIdx]
                }

            },
            methods: {
                toggleSelectComp(comp) {
                    if(this.comps.indexOf(comp) == this.$store.state.selectedIdx) {
                        this.$store.commit('selectComp', null)
                    } else {
                        this.$store.commit('selectComp', comp)
                    }
                },
                insertComp(comp, idx){
                    this.$store.commit('insertComp', [comp, idx])
                },
                changeCompIndex(from, to){
                    this.$store.commit('changeCompIndex', [from, to])
//                    this.$nextTick(() => this.$forceUpdate());
                }
            },
            mounted:function(){
                const that = this
                const srcPane = document.getElementById('src-pane')
                const inputs = new Sortable(srcPane, {
                    draggable:".comp",
                    sort: false,
                    group: {
                        name: 'shared',
                        put: false,
                        pull: 'clone'
                    },

                })
                const mainPane = document.getElementById('main-pane')
                const sort = new Sortable(mainPane, {
                    group: {
                        name: 'shared',
                    },
                    onAdd: function (/**Event*/evt) {
                        const items = document.querySelectorAll('#main-pane>div')
                        for(let i=0;i<items.length;i++) {
                            if(items[i].classList.contains("comp")) {
                                const compclass = items[i].getAttribute("data-compclass")
                                items[i].remove()
                                that.insertComp(new componentClasses[compclass](), i)
                                break;
                            }
                        }
                    },
                    onEnd: function (/**Event*/evt) {
                        that.changeCompIndex(evt.oldIndex,evt.newIndex)    
                    },


                })
            },
            components:compObjects
        })
        
        Vue.component('control-pane', {
            template: `<div v-if="selectedIdx!==-1">

                            <div  v-for="(item, key, compIndex) in getInputs(selectedComp)">
                                <label v-html="key" :for="'comp-'+selectedIdx+'-'+key"></label>
                                <input :type="getInputType(selectedComp, key)" :id="'comp-'+selectedIdx+'-'+key" v-model="comps[selectedIdx].getStore().state.settings[key]">
                            </div>
                            <button v-on:click="delComp(selectedIdx)">Delete#{{selectedIdx}}</button>    
                        </div>
                        `,
            store:store,
            computed: {
                comps () {
                  return this.$store.state.comps
                },
                selectedIdx () {
                  return this.$store.state.selectedIdx
                },
                selectedComp() {
                    return this.$store.state.comps[this.$store.state.selectedIdx]
                },
                delComp(idx) {
                    this.$store.commit('delComp', idx)
                }
            },
            methods:{
                getInputs(comp) {
                    return comp.getSettingControl()
                },
                getInputType(comp, name) {
                    return comp.getSettingControl()[name].type
                }
            },

        })
        
        Vue.component('comp-pane', {
            template: `<div id="src-pane">
                            <div v-for="(item, key, index) in componentClasses" class="comp" :data-compclass="key">
                                
                                <component v-bind:is="key" :defaultSettings="item.loadDefaultSettings()" >
                                </component>
                                
                               
                            </div>
                            <div v-for="(item, key, index) in componentClasses" >
                             <button v-on:click="addComp(item)">add {{key}}</button>
                            </div>
                        </div>
                        `,
            store:store,
            computed: {
                componentClasses () {
                  return componentClasses
                },
            },
            methods:{
                addComp(comp){
                    this.$store.commit('addComp', (new comp()))
                }                
            },
            components:compObjects

        })

        const vm = new Vue({
            el: el,

        })

        return {vue:vm}
    }
    

    const compObjects = {}
    const store = new Vuex.Store({
        state: {
            comps:[],
            //compSettings:[],
            selectedIdx:-1
        },
        mutations: {
            addComp(state, comp) {
                const vx = new Vuex.Store({
                    state: {
                        settings:comp.getDefaultSettings()              
                    },
                    mutations: {
                        changeSetting:(state1, obj)=>{
                            state1.settings = obj
                        }
                    }
                })
                comp.setStore(vx)
                state.comps.push(comp)
                //state.compSettings.push(vx);
            },
            insertComp(state, param) {
                const comp = param[0]
                const index = param[1]
                const vx = new Vuex.Store({
                    state: {
                        settings:comp.getDefaultSettings()                
                    },
                    mutations: {
                        changeSetting:(state1, obj)=>{
                            state1.settings = obj
                        }
                    }
                })
                comp.setStore(vx)
                state.comps.splice(index, 0, comp)
                //state.compSettings.splice(index, 0, vx);
                state.selectedIdx = -1
            },
            changeCompIndex(state, param) {
                const fromIndex = param[0]
                const toIndex = param[1]
                const comp = state.comps.splice(fromIndex, 1)
                state.comps.splice(toIndex, 0, comp[0])
                state.selectedIdx = -1
            },
            selectComp(state, comp) {
                state.selectedIdx = (comp===null?-1:state.comps.indexOf(comp))
            },
            delComp(state, idx) {

//                const vx = state.compSettings.splice(idx, 1);
                const comp = state.comps.splice(idx, 1)
            },
        }
    })
    
    class Main {
        constructor(elm) {
            initVueApp(elm)
        }
        

        
        addComp(comp) {
            store.commit('addComp', comp)
            return store.state.comps.length-1
        }
        
        insertComp(comp, idx) {
            store.commit('insertComp', [comp, idx])
            return idx
        }
        
        changeSetting(compIndex, setting) {
            store.state.comps[compIndex].getStore().commit('changeSetting', setting)
        }

        
        static getComponentClass(name) {
            return componentClasses[name]
        }
        

        static createComponentClass = (json) => {
            ((json)=>{
                class mycls extends Component {
                    constructor(settings) {
                        super(settings || json.defaultSettings)
                    }
                    
                    getSettingControl() {
                        return json.control
                    }
                    
                    static getTemplate() {
                        return json.template
                    }
                    
                    static loadDefaultSettings() {
                        return json.defaultSettings
                    }
                    
                    static getName() {
                        return json.name
                    }
                    
                    getCompName() {
                        return json.name
                    }
                }    
                componentClasses[json.name] = mycls
                compObjects[mycls.getName()] = {
                    template:mycls.getTemplate(),
                    props: ['props', 'defaultSettings'],
                    methods:{
                    },
                    computed: {
                        settings () {

                          return this.defaultSettings?this.defaultSettings:this.props.state.settings
                        }
                    }
                }
                
            })(json)
            return componentClasses[json.name];
        }

    }
    
    return Main;

})();









