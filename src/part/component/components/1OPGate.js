import ComponentBuilder from "../../../../map/component.js";
import { Listener, Emitter } from "../../../../map/component.js";
import { World } from "../../../../map/world.js";

class Component1Operation extends ComponentBuilder
{
    build(component)
    {
        component.width = 2;
        component.height = 1;
        component.addInteractor(Listener, "input", 0, 0);
        component.addInteractor(Emitter, "output", 1, 0);
    }
}

class NOTGate extends Component1Operation
{
    evaluate(component)
    {
        component.interactors.output.setState(!component.interactors.input.state);
    }
}

class BufferGate extends Component1Operation
{
    static name = "Buffer Gate"
    evaluate(component)
    {
        component.interactors.output.setState(component.interactors.input.state);
    }
}

function setup(app, container)
{
    World.global_registry["builtin:notgate"] = new NOTGate("NOT Gate");
    World.global_registry["builtin:buffergate"] = new BufferGate("Buffer Gate");
}

export {setup};