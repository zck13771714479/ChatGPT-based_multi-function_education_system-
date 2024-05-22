// element-ui.js
import Vue from 'vue'
import {
    Button,
    Card,
    Progress,
    Tooltip,
    PageHeader,
    Dialog,
    Tabs,
    TabPane,
    Form,
    FormItem,
    Input,
    Slider,
    Checkbox,
    CheckboxGroup,
    Select,
    Option,
    InputNumber,
    

} from 'element-ui'
import locale from 'element-ui/lib/locale/lang/en'

const components = [
    Button,
    Card,
    Progress,
    Tooltip,
    PageHeader,
    Dialog,
    Tabs,
    TabPane,
    Form,
    FormItem,
    Input,
    Slider,
    Checkbox,
    CheckboxGroup,
    Select,
    Option,
    InputNumber
];

const Element = {
    install(Vue) {
        components.forEach(component => {
            // console.log(component.name);
            Vue.component(component.name, component)
        })
    }
}

Vue.use(Element, { locale })