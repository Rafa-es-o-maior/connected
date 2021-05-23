import ComponentBuilder from "../../../../map/component.js";
import { Listener, Emitter } from "../../../../map/component.js";
import { World } from "../../../../map/world.js";
class Timeout extends ComponentBuilder
{
    build(component)
    {
        component.width = 2;
        component.height = 1;
        component.addInteractor(Listener, "input", 0, 0);
        component.addInteractor(Emitter, "output", 1, 0);
    }


    evaluate(component)
    {
        let setting = component.interactors.input.state;

        setTimeout(()=>{
            component.interactors.output.setState(setting);
        }, 1000);
    }
}

function setup(app, container)
{
    World.global_registry["builtin:timeoutgate"] = new Timeout("Timeout Gate");
}

export {setup};