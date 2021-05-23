import ComponentBuilder from "../../../../map/component.js";
import { Listener, Emitter } from "../../../../map/component.js";
import { World } from "../../../../map/world.js";
class UserInput extends ComponentBuilder
{
    build(component)
    {
        component.width = 1;
        component.height = 1;
        component.addInteractor(Emitter, "output", 0, 0);
    }

    evaluate(component){}
}

class Switch extends UserInput
{
    click(component)
    {
        component.interactors.output.setState(!component.interactors.output.state);
    }
}

class Button extends UserInput
{
    constructor(world, x, y, layout)
    {
        super(world, x, y, layout);
        this.thread = null;
    }

    click(component)
    {
        component.interactors.output.setState(true);

        if(this.thread !== null)
        {
            clearTimeout(this.thread);
        }

        this.thread = setTimeout(()=>{
            component.interactors.output.setState(false);
        }, 100);
    }
}


function setup(app, container)
{
    World.global_registry["builtin:switch"] = new Switch("Switch");
    World.global_registry["builtin:button"] = new Button("Button");
}

export {setup};