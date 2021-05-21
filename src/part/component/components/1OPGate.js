import ComponentBuilder from "../../../../map/component.js";
import { Listener, Emitter } from "../../../../map/component.js";

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
    app.component.registerComponent("builtin:notgate", new NOTGate("NOT Gate"));
    app.component.registerComponent("builtin:buffergate", new BufferGate("Buffer Gate"));
}

export {setup};